import "server-only";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";

/**
 * Transform a post from database to feed format
 */
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

    likes: displayPost.likes?.length || 0,
    reposts: displayPost.repostActions?.length || 0,

    liked: currentUserId
      ? displayPost.likes?.some((like) => like.userId === currentUserId)
      : false,

    reposted: currentUserId
      ? displayPost.repostActions?.some((repost) => repost.userId === currentUserId)
      : false,

    photographerName: displayName,
    username,
    avatar: displayUser?.profile?.avatarUrl || null,

    userId: displayUser?.id || null,
    createdAt: post.createdAt,
  };
}

/**
 * Get feed posts
 * @param {string} feedType - 'forYou' or 'following'
 * @param {number} limit - Number of posts to fetch
 * @param {string|null} cursor - Cursor for pagination (post ID)
 */
export async function getFeedPosts(feedType = "forYou", limit = 20, cursor = null) {
  const currentUser = await getCurrentUser();

  const where = {
    // photoId: { not: null },
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
    include: {
      photo: true,
      user: { include: { profile: true } },
      likes: true,
      repostActions: true,
      originalPost: {
        include: {
          user: { include: { profile: true } },
          photo: true,
          likes: true,
          repostActions: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
  });

  const hasMore = posts.length > limit;
  const postsToReturn = hasMore ? posts.slice(0, -1) : posts;
  const nextCursor = hasMore ? postsToReturn[postsToReturn.length - 1].id : null;

  return {
    posts: postsToReturn.map((post) => transformPost(post, currentUser?.id)),
    nextCursor,
    hasMore,
  };
}

export async function getPostById(postId) {
  const currentUser = await getCurrentUser();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      photo: true,
      user: { include: { profile: true } },
      likes: true,
      repostActions: true,
      originalPost: {
        include: {
          user: { include: { profile: true } },
          photo: true,
          likes: true,
          repostActions: true,
        },
      },
    },
  });

  if (!post) return null;

  return transformPost(post, currentUser?.id);
}
