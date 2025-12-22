// server/services/search.js
import prisma from "@/server/db/prisma";
import { getCurrentUser } from "../auth/auth-server";
import { redis, cacheKeys, cacheTTL } from "./redis/redis";

export async function searchAll(query, limit = 10) {
  const q = query.trim();

  if (!q) {
    return {
      people: [],
      images: [],
      blogs: [],
    };
  }

  const safeLimit =
    typeof limit === "number" && limit >= 1 && limit <= 50 ? limit : 10;

      // Try cache first (short TTL for search)
  const cacheKey = cacheKeys.search(q);

  
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`[CACHE HIT] ${cacheKey}`);
      return cached;
    }
  } catch (err) {
    console.error("Redis get error:", err);
  }

  console.log(`[CACHE MISS] ${cacheKey}`);

  const currentUser = await getCurrentUser();

  // Run searches in parallel
  const [users, posts] = await Promise.all([
    // PEOPLE SEARCH
    prisma.user.findMany({
      where: {
        OR: [
          { profile: { displayName: { contains: q, mode: "insensitive" } } },
          { profile: { username: { contains: q, mode: "insensitive" } } },
          { profile: { bio: { contains: q, mode: "insensitive" } } },
        ],
      },
      take: safeLimit,
      select: {
        id: true,
        profile: {
          select: {
            displayName: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    }),

    // BLOGS SEARCH
    prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
          { tags: { hasSome: [q] } },
        ],
      },
      take: safeLimit,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverUrl: true,
        tags: true,
        publishedAt: true,
        author: {
          select: {
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
      },
    }),
  ]);

  // ✅ Batch follow state and counts
  let followStatusMap = new Map();
  let followerCountMap = new Map();

  if (users.length > 0) {
    const userIds = users.map((u) => u.id);

    // Get all follower counts in one query using groupBy
    const followerCounts = await prisma.follow.groupBy({
      by: ["followingId"],
      where: { followingId: { in: userIds } },
      _count: { followingId: true },
    });

    followerCounts.forEach((fc) => {
      followerCountMap.set(fc.followingId, fc._count.followingId);
    });

    // Get current user's follow status in one query
    if (currentUser) {
      const follows = await prisma.follow.findMany({
        where: {
          followerId: currentUser.id,
          followingId: { in: userIds },
        },
        select: { followingId: true },
      });

      follows.forEach((f) => {
        followStatusMap.set(f.followingId, true);
      });
    }
  }

  // Map results in memory
  const people = users.map((u) => ({
    id: u.id,
    userId: u.id,
    avatar: u.profile?.avatarUrl ?? null,
    name: u.profile?.displayName ?? u.profile?.username ?? "Unknown",
    username: u.profile?.username ?? "unknown",
    bio: u.profile?.bio ?? "",
    followerCount: followerCountMap.get(u.id) || 0,
    viewer: {
      isAuthenticated: !!currentUser,
      isFollowing: followStatusMap.get(u.id) || false,
    },
  }));

  const blogs = posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    cover: post.coverUrl,
    tags: post.tags,
    publishedAt: post.publishedAt,
    author: {
      name:
        post.author.profile?.displayName ??
        post.author.profile?.username ??
        post.author.email,
      avatar: post.author.profile?.avatarUrl ?? null,
      username: post.author.profile?.username ?? null,
    },
  }));


  const results = { people, images: [], blogs };


 // Cache with short TTL (search changes frequently)
  try {
    await redis.set(cacheKey, JSON.stringify(results), { ex: cacheTTL.search });
  } catch (err) {
    console.error("Redis set error:", err);
  }

  return results;
}