import "server-only";

import { prisma } from "@/server/db/prisma";
import { getCurrentUser } from "@/server/auth/auth-server";
// import { redis, cacheKeys, cacheTTL } from "@/lib/redis";
import { redis, cacheKeys, cacheTTL } from "./redis/redis";

function transformPost(post, currentUserId) {
  const isRepost = post.type === "REPOST" && post.originalPost;
  const displayPost = isRepost ? post.originalPost : post;
  const displayUser = displayPost.user;

  const displayName =
    displayUser?.profile?.displayName ||
    (displayUser?.email ? displayUser.email.split("@")[0] : "User");

  const username =
    displayUser?.profile?.username ||
    (displayUser?.email ? displayUser.email.split("@")[0] : "user");

  return {
    id: post.id,
    image: displayPost.photo?.url || "",
    thumbUrl: displayPost.photo?.thumbUrl || null,
    caption: displayPost.photo?.caption || displayPost.caption || null,
    location: displayPost.photo?.location || null,
    tags: displayPost.photo?.tags || [],
    likes: displayPost._count?.likes || 0,
    reposts: displayPost._count?.repostActions || 0,
    liked: displayPost.userLiked || false,
    reposted: displayPost.userReposted || false,
    photographerName: displayName,
    username,
    avatar: displayUser?.profile?.avatarUrl || null,
    userId: displayUser?.id || null,
    createdAt: post.createdAt,
  };
}

// Main cached function
export async function getFeedPosts(feedType = "forYou", limit = 20, cursor = null) {
  const currentUser = await getCurrentUser();
  const userId = currentUser?.id || "anon";

  // Try cache first
  const cacheKey = cacheKeys.feed(userId, feedType, cursor, limit);

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`[CACHE HIT] ${cacheKey}`);
      return cached;
    }
  } catch (err) {
    console.error("Redis get error:", err);
    // Continue to DB if cache fails
  }

  console.log(`[CACHE MISS] ${cacheKey}`);

  // Fetch from DB
  const data = await getFeedPostsFromDb(feedType, limit, cursor, currentUser);

  // Store in cache
  try {
    await redis.set(cacheKey, JSON.stringify(data), { ex: cacheTTL.feed });
  } catch (err) {
    console.error("Redis set error:", err);
    // Non-blocking - return data even if cache fails
  }

  return data;
}

// DB fetch logic (your optimized version from Section 2)
async function getFeedPostsFromDb(feedType, limit, cursor, currentUser) {
  const where = {
    type: "PHOTO",
    photoId: { not: null },
  };

  if (feedType === "following" && currentUser) {
    const following = await prisma.follow.findMany({
      where: { followerId: currentUser.id },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);

    if (followingIds.length === 0) {
      return { posts: [], nextCursor: null, hasMore: false };
    }

    where.userId = { in: followingIds };
  }

  const posts = await prisma.post.findMany({
    where,
    select: {
      id: true,
      type: true,
      caption: true,
      photoId: true,
      userId: true,
      createdAt: true,
      photo: {
        select: {
          url: true,
          thumbUrl: true,
          caption: true,
          location: true,
          tags: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              displayName: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      },
      _count: {
        select: {
          likes: true,
          repostActions: true,
        },
      },
      originalPost: {
        select: {
          id: true,
          caption: true,
          userId: true,
          photo: {
            select: {
              url: true,
              thumbUrl: true,
              caption: true,
              location: true,
              tags: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  displayName: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
              repostActions: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = posts.length > limit;
  const postsToReturn = hasMore ? posts.slice(0, -1) : posts;

  // Batch check user interactions
  let userLikes = new Set();
  let userReposts = new Set();

  if (currentUser) {
    const postIds = postsToReturn.flatMap((p) => {
      const ids = [p.id];
      if (p.originalPost) ids.push(p.originalPost.id);
      return ids;
    });

    const [likes, reposts] = await Promise.all([
      prisma.like.findMany({
        where: {
          userId: currentUser.id,
          postId: { in: postIds },
        },
        select: { postId: true },
      }),
      prisma.repost.findMany({
        where: {
          userId: currentUser.id,
          postId: { in: postIds },
        },
        select: { postId: true },
      }),
    ]);

    userLikes = new Set(likes.map((l) => l.postId));
    userReposts = new Set(reposts.map((r) => r.postId));
  }

  // Attach interaction flags
  const enrichedPosts = postsToReturn.map((post) => {
    const displayPost = post.type === "REPOST" && post.originalPost ? post.originalPost : post;

    return {
      ...post,
      originalPost: post.originalPost
        ? {
            ...post.originalPost,
            userLiked: userLikes.has(post.originalPost.id),
            userReposted: userReposts.has(post.originalPost.id),
          }
        : null,
      userLiked: userLikes.has(displayPost.id),
      userReposted: userReposts.has(displayPost.id),
    };
  });

  const nextCursor = hasMore ? postsToReturn[postsToReturn.length - 1].id : null;

  return {
    posts: enrichedPosts.map((post) => transformPost(post, currentUser?.id)),
    nextCursor,
    hasMore,
  };
}

export async function getPostById(postId) {
  const currentUser = await getCurrentUser();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      type: true,
      caption: true,
      photoId: true,
      userId: true,
      createdAt: true,
      photo: {
        select: {
          url: true,
          thumbUrl: true,
          caption: true,
          location: true,
          tags: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              displayName: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      },
      _count: {
        select: {
          likes: true,
          repostActions: true,
        },
      },
      originalPost: {
        select: {
          id: true,
          caption: true,
          userId: true,
          photo: {
            select: {
              url: true,
              thumbUrl: true,
              caption: true,
              location: true,
              tags: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  displayName: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
              repostActions: true,
            },
          },
        },
      },
    },
  });

  if (!post) return null;

  let userLiked = false;
  let userReposted = false;

  if (currentUser) {
    const displayPost = post.type === "REPOST" && post.originalPost ? post.originalPost : post;

    const [like, repost] = await Promise.all([
      prisma.like.findUnique({
        where: {
          userId_postId: {
            userId: currentUser.id,
            postId: displayPost.id,
          },
        },
      }),
      prisma.repost.findUnique({
        where: {
          userId_postId: {
            userId: currentUser.id,
            postId: displayPost.id,
          },
        },
      }),
    ]);

    userLiked = !!like;
    userReposted = !!repost;
  }

  const enrichedPost = {
    ...post,
    originalPost: post.originalPost
      ? {
          ...post.originalPost,
          userLiked,
          userReposted,
        }
      : null,
    userLiked,
    userReposted,
  };

  return transformPost(enrichedPost, currentUser?.id);
}

