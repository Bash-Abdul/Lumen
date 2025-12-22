
// server/services/profile.js
import { prisma } from "@/server/db/prisma";
import { getCurrentUser } from "@/server/auth/auth-server";
import { redis, cacheKeys, cacheTTL } from "@/server/services/redis/redis";

function socialsToLinks(website, socials, email) {
  const links = [];
  if (website) links.push({ label: "Website", url: website });
  if (email) links.push({ label: "Email", url: email });

  if (socials) {
    if (socials.instagram) links.push({ label: "Instagram", url: socials.instagram });
    if (socials.twitter) links.push({ label: "Twitter", url: socials.twitter });
    if (socials.linkedin) links.push({ label: "LinkedIn", url: socials.linkedin });
    if (socials.snapchat) links.push({ label: "Snapchat", url: socials.snapchat });
  }

  return links;
}

export async function getProfileByUsername(username, postsLimit = 30, repostsLimit = 30) {
  if (!username || typeof username !== "string") return null;

  const currentUser = await getCurrentUser();
  const cacheKey = cacheKeys.profile(username);

  // Check if viewing own profile
  const userProfile = currentUser
    ? await prisma.profile.findUnique({
        where: { id: currentUser.id },
        select: { username: true },
      })
    : null;

  const isOwnProfile = userProfile?.username === username;

  // Try cache first (only for public profiles, not own profile)
  if (!isOwnProfile) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`[CACHE HIT] ${cacheKey}`);
        const cachedData = JSON.parse(cached);

        // Update follow status for current user (dynamic data)
        if (currentUser && cachedData.viewer) {
          const isFollowing = await prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: currentUser.id,
                followingId: cachedData.id,
              },
            },
          });
          cachedData.viewer.isFollowing = !!isFollowing;
          cachedData.viewer.isAuthenticated = true;
        }

        return cachedData;
      }
    } catch (err) {
      console.error("Redis get error:", err);
    }
  }

  console.log(`[CACHE MISS] ${cacheKey}`);

  // Fetch from DB
  const data = await getProfileByUsernameFromDb(
    username,
    postsLimit,
    repostsLimit,
    currentUser,
    isOwnProfile
  );

  // Cache for public profiles only
  if (data && !isOwnProfile) {
    try {
      await redis.set(cacheKey, JSON.stringify(data), { ex: cacheTTL.profile });
    } catch (err) {
      console.error("Redis set error:", err);
    }
  }

  return data;
}

async function getProfileByUsernameFromDb(
  username,
  postsLimit,
  repostsLimit,
  currentUser,
  isOwnProfile
) {
  const profile = await prisma.profile.findUnique({
    where: { username },
    select: {
      id: true,
      displayName: true,
      username: true,
      bio: true,
      location: true,
      avatarUrl: true,
      website: true,
      socials: true,
      stats: true,
      user: {
        select: {
          email: true,
          createdAt: true,
        },
      },
    },
  });

  if (!profile) return null;

  // ✅ Fetch posts and reposts in parallel with _count (optimized)
  const [posts, reposts, followCounts, isFollowing] = await Promise.all([
    // Posts query with _count
    prisma.post.findMany({
      where: {
        userId: profile.id,
        type: "PHOTO",
        photo: { isNot: null },
      },
      select: {
        id: true,
        caption: true,
        createdAt: true,
        photo: {
          select: {
            url: true,
            thumbUrl: true,
            caption: true,
            tags: true,
          },
        },
        _count: {
          select: {
            likes: true,
            repostActions: true,
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
      },
      orderBy: { createdAt: "desc" },
      take: postsLimit,
    }),

    // Reposts query with _count
    prisma.post.findMany({
      where: {
        userId: profile.id,
        type: "REPOST",
        originalPost: {
          photo: { isNot: null },
        },
      },
      select: {
        id: true,
        createdAt: true,
        originalPost: {
          select: {
            id: true,
            caption: true,
            createdAt: true,
            photo: {
              select: {
                url: true,
                thumbUrl: true,
                caption: true,
                tags: true,
              },
            },
            _count: {
              select: {
                likes: true,
                repostActions: true,
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
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: repostsLimit,
    }),

    // ✅ Batch follow counts
    prisma.$transaction([
      prisma.follow.count({ where: { followerId: profile.id } }),
      prisma.follow.count({ where: { followingId: profile.id } }),
    ]),

    // Check follow status
    currentUser
      ? prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUser.id,
              followingId: profile.id,
            },
          },
        })
      : Promise.resolve(null),
  ]);

  const [followingCount, followerCount] = followCounts;

  // ✅ Batch check user interactions
  let userLikedPosts = new Set();
  let userRepostedPosts = new Set();

  if (currentUser) {
    const allPostIds = [
      ...posts.map((p) => p.id),
      ...reposts.map((r) => r.originalPost?.id).filter(Boolean),
    ];

    const [likes, repostActions] = await Promise.all([
      prisma.like.findMany({
        where: {
          userId: currentUser.id,
          postId: { in: allPostIds },
        },
        select: { postId: true },
      }),
      prisma.repost.findMany({
        where: {
          userId: currentUser.id,
          postId: { in: allPostIds },
        },
        select: { postId: true },
      }),
    ]);

    userLikedPosts = new Set(likes.map((l) => l.postId));
    userRepostedPosts = new Set(repostActions.map((r) => r.postId));
  }

  // Transform posts
  const transformedPosts = posts.map((post) => {
    const postUser = post.user;
    const postUsername =
      postUser?.profile?.username ||
      (postUser?.email ? postUser.email.split("@")[0] : profile.username);

    const photographerName =
      postUser?.profile?.displayName ||
      (postUser?.email ? postUser.email.split("@")[0] : profile.displayName || profile.username);

    return {
      id: post.id,
      username: postUsername,
      photographerName,
      avatar: postUser?.profile?.avatarUrl || profile.avatarUrl || null,

      image: post.photo?.thumbUrl || post.photo?.url || "",
      fullImage: post.photo?.url || "",
      caption: post.photo?.caption || post.caption || "",
      tags: post.photo?.tags || [],

      likes: post._count?.likes || 0,
      reposts: post._count?.repostActions || 0,

      liked: userLikedPosts.has(post.id),
      reposted: userRepostedPosts.has(post.id),

      createdAt: post.createdAt,
    };
  });

  // Transform reposts
  const transformedReposts = reposts
    .filter((repost) => repost.originalPost)
    .map((repost) => {
      const original = repost.originalPost;
      const originalUser = original.user;

      const originalUsername =
        originalUser?.profile?.username ||
        (originalUser?.email ? originalUser.email.split("@")[0] : null);

      const originalName =
        originalUser?.profile?.displayName ||
        (originalUser?.email ? originalUser.email.split("@")[0] : "User");

      const originalAvatar = originalUser?.profile?.avatarUrl || null;

      return {
        id: original.id,

        username: originalUsername,
        photographerName: originalName,
        avatar: originalAvatar,

        image: original.photo?.thumbUrl || original.photo?.url || "",
        fullImage: original.photo?.url || "",
        caption: original.photo?.caption || original.caption || "",
        tags: original.photo?.tags || [],

        likes: original._count?.likes || 0,
        reposts: original._count?.repostActions || 0,

        liked: userLikedPosts.has(original.id),
        reposted: userRepostedPosts.has(original.id),

        createdAt: original.createdAt,
        repostedAt: repost.createdAt,

        repostedBy: profile.username,
      };
    });

  const links = socialsToLinks(
    profile.website,
    profile.socials,
    isOwnProfile ? profile.user?.email : null
  );

  const profileStats = profile.stats || {};

  return {
    id: profile.id,
    userId: profile.id,
    name: profile.displayName || profile.username,
    username: profile.username,
    avatar: profile.avatarUrl,
    bio: profile.bio || "",
    location: profile.location || "",
    email: isOwnProfile ? profile.user?.email || "" : "",
    website: profile.website || "",
    socials: profile.socials || {},
    links,
    createdAt: profile.user?.createdAt,

    posts: transformedPosts,
    reposts: transformedReposts,

    counters: {
      photos: transformedPosts.length,
      reposts: transformedReposts.length,
      likes: profileStats.likeCount || 0,
      repostsReceived: profileStats.repostCount || 0,
      followers: followerCount,
      following: followingCount,
    },
    viewer: {
      isAuthenticated: !!currentUser,
      isFollowing: !!isFollowing,
      isOwnProfile,
    },
  };
}
