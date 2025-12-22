"use server"

import prisma from "@/server/db/prisma";
import { getCurrentUser } from "@/server/auth/auth-server";
import { revalidatePath } from "next/cache";
import { uploadImage } from "@/server/services/cloudinary";
import { invalidateFeedCache, invalidateProfileCache } from "../services/redis/cache-invalidation";
const MAX_FILES = 10;
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadPhotos(formData) {
    const uploadedSoFar = []; // for cleanup if something fails
  
    try {
      const user = await getCurrentUser();
      if (!user) return { error: "Not authenticated" };
  
      const files = formData.getAll("photos");
  
      if (!files || files.length === 0) {
        return { error: "Please select at least one photo" };
      }
  
      if (files.length > MAX_FILES) {
        return { error: `You can upload a maximum of ${MAX_FILES} photos at once` };
      }
  
      // Validate on server too
      for (const file of files) {
        if (!file || typeof file !== "object") {
          return { error: "Invalid file upload" };
        }
  
        if (!file.type?.startsWith("image/")) {
          return { error: "Only image files are allowed" };
        }
  
        if (file.size > MAX_SIZE) {
          return { error: "Each file must be less than 10MB" };
        }
      }
  
      // Upload each file to Cloudinary, then create Photo + Post in DB
      const created = [];
  
      for (const file of files) {
        const uploaded = await uploadImage(file, `photos/${user.id}`);
  
        uploadedSoFar.push(uploaded); // track for cleanup if later steps fail

            // Create photo and post in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const photo = await tx.photo.create({
          data: {
            userId: user.id,
            url: uploaded.url,
            thumbUrl: uploaded.thumbUrl,
            tags: [], // REQUIRED by your schema
            visibility: "PUBLIC",
            // caption, location, exif are optional, can add later
          },
        });

        const post = await tx.post.create({
          data: {
            userId: user.id,
            photoId: photo.id,
            type: "PHOTO",
            caption: null,
          },
        });

        // Update user's post count in profile stats
        const profile = await tx.profile.findUnique({
          where: { id: user.id },
        });

        if (profile) {
          const stats = profile.stats || {};
          await tx.profile.update({
            where: { id: user.id },
            data: {
              stats: {
                ...stats,
                postCount: (stats.postCount || 0) + 1,
              },
            },
          });
        }

        return { photoId: photo.id, postId: post.id };
      });

      created.push(result);
    }


        // ✅ Invalidate caches
        const profile = await prisma.profile.findUnique({
          where: { id: user.id },
          select: { username: true },
        });
    
        await Promise.all([
          invalidateFeedCache([user.id]), // Invalidate user's feed cache
          profile?.username ? invalidateProfileCache(profile.username) : null,
        ]);
  
      //   const photo = await prisma.photo.create({
      //     data: {
      //       userId: user.id,
      //       url: uploaded.url,
      //       thumbUrl: uploaded.thumbUrl,
      //       tags: [], // REQUIRED by your schema
      //       // caption, location, exif are optional, you can add later
      //     },
      //     select: { id: true },
      //   });
  
      //   const post = await prisma.post.create({
      //     data: {
      //       userId: user.id,
      //       photoId: photo.id,
      //       type: "PHOTO",
      //       caption: null,
      //     },
      //     select: { id: true },
      //   });
  
      //   created.push({ photoId: photo.id, postId: post.id });
      // }
  
      revalidatePath("/feed");
      revalidatePath("/profile");
  
      return { success: true, count: created.length, created };
    } catch (err) {
      console.error("uploadPhotos error:", err);
  
      // Best effort cleanup on Cloudinary if DB failed after uploads
      try {
        for (const item of uploadedSoFar) {
          if (item?.publicId) {
            await deleteImage(item.publicId);
          }
        }
      } catch (cleanupErr) {
        console.error("Cloudinary cleanup error:", cleanupErr);
      }
  
      return { error: "Failed to upload photos" };
    }
  }




  /**
 * Like or unlike a post
 */
export async function likePost(postId) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Not authenticated" };

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.$transaction(async (tx) => {
        await tx.like.delete({
          where: {
            userId_postId: {
              userId: user.id,
              postId,
            },
          },
        });

        // Update post owner's like count
        const post = await tx.post.findUnique({
          where: { id: postId },
          include: { user: { include: { profile: true } } },
        });

        if (post?.user.profile) {
          const stats = post.user.profile.stats || {};
          await tx.profile.update({
            where: { id: post.userId },
            data: {
              stats: {
                ...stats,
                likeCount: Math.max((stats.likeCount || 0) - 1, 0),
              },
            },
          });
        }
      });

      const likeCount = await prisma.like.count({ where: { postId } });

          // ✅ Invalidate feed cache for user
          await invalidateFeedCache([user.id]);

      revalidatePath("/feed");
      revalidatePath(`/post/${postId}`);

      return { success: true, liked: false, likeCount };
    } else {
      // Like
      await prisma.$transaction(async (tx) => {
        await tx.like.create({
          data: {
            userId: user.id,
            postId,
          },
        });

        // Update post owner's like count
        const post = await tx.post.findUnique({
          where: { id: postId },
          include: { user: { include: { profile: true } } },
        });

        if (post?.user.profile) {
          const stats = post.user.profile.stats || {};
          await tx.profile.update({
            where: { id: post.userId },
            data: {
              stats: {
                ...stats,
                likeCount: (stats.likeCount || 0) + 1,
              },
            },
          });
        }
      });

      const likeCount = await prisma.like.count({ where: { postId } });
      // ✅ Invalidate feed cache for user
      await invalidateFeedCache([user.id]);

      revalidatePath("/feed");
      revalidatePath(`/post/${postId}`);

      return { success: true, liked: true, likeCount };
    }
  } catch (err) {
    console.error("likePost error:", err);
    return { error: "Failed to like post" };
  }
}





/**
 * Repost or un-repost a post
 */
export async function repostPost(postId) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Not authenticated" };

    const existingRepost = await prisma.repost.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
    });

    if (existingRepost) {
      // Un-repost
      await prisma.$transaction(async (tx) => {
        await tx.repost.delete({
          where: {
            userId_postId: {
              userId: user.id,
              postId,
            },
          },
        });

        // Delete the repost post
        const repostPost = await tx.post.findFirst({
          where: {
            userId: user.id,
            originalPostId: postId,
            type: "REPOST",
          },
        });

        if (repostPost) {
          await tx.post.delete({ where: { id: repostPost.id } });
        }

        // Update original post owner's repost count
        const post = await tx.post.findUnique({
          where: { id: postId },
          include: { user: { include: { profile: true } } },
        });

        if (post?.user.profile) {
          const stats = post.user.profile.stats || {};
          await tx.profile.update({
            where: { id: post.userId },
            data: {
              stats: {
                ...stats,
                repostCount: Math.max((stats.repostCount || 0) - 1, 0),
              },
            },
          });
        }

        // Update current user's post count
        const userProfile = await tx.profile.findUnique({
          where: { id: user.id },
        });

        if (userProfile) {
          const userStats = userProfile.stats || {};
          await tx.profile.update({
            where: { id: user.id },
            data: {
              stats: {
                ...userStats,
                postCount: Math.max((userStats.postCount || 0) - 1, 0),
              },
            },
          });
        }
      });

      const repostCount = await prisma.repost.count({ where: { postId } });

        // ✅ Invalidate caches
        const profile = await prisma.profile.findUnique({
          where: { id: user.id },
          select: { username: true },
        });
  
        await Promise.all([
          invalidateFeedCache([user.id]),
          profile?.username ? invalidateProfileCache(profile.username) : null,
        ]);


      revalidatePath("/feed");
      revalidatePath(`/post/${postId}`);
      revalidatePath("/profile");

      return { success: true, reposted: false, repostCount };
    } else {
      // Repost
      await prisma.$transaction(async (tx) => {
        await tx.repost.create({
          data: {
            userId: user.id,
            postId,
          },
        });

        // Create repost post
        await tx.post.create({
          data: {
            userId: user.id,
            originalPostId: postId,
            type: "REPOST",
          },
        });

        // Update original post owner's repost count
        const post = await tx.post.findUnique({
          where: { id: postId },
          include: { user: { include: { profile: true } } },
        });

        if (post?.user.profile) {
          const stats = post.user.profile.stats || {};
          await tx.profile.update({
            where: { id: post.userId },
            data: {
              stats: {
                ...stats,
                repostCount: (stats.repostCount || 0) + 1,
              },
            },
          });
        }

        // Update current user's post count
        const userProfile = await tx.profile.findUnique({
          where: { id: user.id },
        });

        if (userProfile) {
          const userStats = userProfile.stats || {};
          await tx.profile.update({
            where: { id: user.id },
            data: {
              stats: {
                ...userStats,
                postCount: (userStats.postCount || 0) + 1,
              },
            },
          });
        }
      });

      const repostCount = await prisma.repost.count({ where: { postId } });

         // ✅ Invalidate caches
         const profile = await prisma.profile.findUnique({
          where: { id: user.id },
          select: { username: true },
        });
  
        await Promise.all([
          invalidateFeedCache([user.id]),
          profile?.username ? invalidateProfileCache(profile.username) : null,
        ]);


      revalidatePath("/feed");
      revalidatePath(`/post/${postId}`);
      revalidatePath("/profile");

      return { success: true, reposted: true, repostCount };
    }
  } catch (err) {
    console.error("repostPost error:", err);
    return { error: "Failed to repost" };
  }
}


/**
 * Delete a post and its photo
 */
export async function deletePost(postId) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Not authenticated" };

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { photo: true },
    });

    if (!post || post.userId !== user.id) {
      return { error: "Post not found or unauthorized" };
    }

    await prisma.$transaction(async (tx) => {
      // Delete post (cascade will handle likes, reposts, etc.)
      await tx.post.delete({
        where: { id: postId },
      });

      // Update user's post count
      const profile = await tx.profile.findUnique({
        where: { id: user.id },
      });

      if (profile) {
        const stats = profile.stats || {};
        await tx.profile.update({
          where: { id: user.id },
          data: {
            stats: {
              ...stats,
              postCount: Math.max((stats.postCount || 0) - 1, 0),
            },
          },
        });
      }
    });

    // Delete from Cloudinary if photo exists
    if (post.photo?.url) {
      try {
        // Extract public_id from URL
        const urlParts = post.photo.url.split("/");
        const filename = urlParts[urlParts.length - 1];
        const publicId = filename.split(".")[0];
        await deleteImage(`photos/${user.id}/${publicId}`);
      } catch (cleanupErr) {
        console.error("Cloudinary cleanup failed:", cleanupErr);
        // Don't fail the whole operation if cloudinary cleanup fails
      }
    }

       // ✅ Invalidate caches
       const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        select: { username: true },
      });
  
      await Promise.all([
        invalidateFeedCache([user.id]),
        profile?.username ? invalidateProfileCache(profile.username) : null,
      ]);


    revalidatePath("/feed");
    revalidatePath("/profile");

    return { success: true };
  } catch (err) {
    console.error("deletePost error:", err);
    return { error: "Failed to delete post" };
  }
}