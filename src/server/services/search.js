// server/services/search.js
import prisma from "@/server/db/prisma";
import { getCurrentUser } from "../auth/auth-server";

export async function searchAll(query, limit = 10) {
  const q = query.trim();

  // if nothing to search, bail quickly
  if (!q) {
    return {
      people: [],
      images: [],
      blogs: [],
    };
  }

  const safeLimit =
    typeof limit === "number" && limit >= 1 && limit <= 50 ? limit : 10;

      // Get current user for follow status
  const currentUser = await getCurrentUser();

  // Run all three searches in parallel
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

    // IMAGES SEARCH
    // prisma.photo.findMany({
    //   where: {
    //     OR: [
    //       { caption: { contains: q, mode: "insensitive" } },
    //       // if tags is string[]
    //       { tags: { hasSome: [q] } },
    //     ],
    //   },
    //   take: safeLimit,
    //   select: {
    //     id: true,
    //     imageUrl: true,
    //     caption: true,
    //     likesCount: true,
    //     user: {
    //       select: {
    //         profile: {
    //           select: {
    //             username: true,
    //           },
    //         },
    //       },
    //     },
    //   },
    // }),

    // BLOGS SEARCH
    prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
          // again, if tags is string[]
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

  // Shape everything to exactly what your SearchPage expects

    // Get follow status for each user if currentUser exists
    const people = await Promise.all(
      users.map(async (u) => {
        let isFollowing = false;
        let followerCount = 0;
  
        if (currentUser) {
          // Check if current user is following this user
          const follow = await prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: currentUser.id,
                followingId: u.id,
              },
            },
          });
          isFollowing = !!follow;
        }
  
        // Get follower count for this user
        followerCount = await prisma.follow.count({
          where: { followingId: u.id },
        });
  
        return {
          id: u.id,
          userId: u.id, // Add userId for FollowButton
          avatar: u.profile?.avatarUrl ?? null,
          name: u.profile?.displayName ?? u.profile?.username ?? "Unknown",
          username: u.profile?.username ?? "unknown",
          bio: u.profile?.bio ?? "",
          followerCount,
          viewer: {
            isAuthenticated: !!currentUser,
            isFollowing,
          },
        };
      })
    );

  // const people = users.map((u) => ({
  //   id: u.id,
  //   avatar: u.profile?.avatarUrl ?? null,
  //   name: u.profile?.displayName ?? u.profile?.username ?? "Unknown",
  //   username: u.profile?.username ?? "unknown",
  //   bio: u.profile?.bio ?? "",
  // }));

//   const images = photos.map((p) => ({
//     id: p.id,
//     image: p.imageUrl,
//     caption: p.caption ?? "",
//     username: p.user?.profile?.username ?? "unknown",
//     likes: p.likesCount ?? 0,
//   }));

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

  return { people, images: [], blogs };
}
