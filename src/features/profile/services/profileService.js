// server/services/profile.js
import { prisma } from "@/server/db/prisma";
import { getCurrentUser } from "@/server/auth/auth-server";

// Map backend socials JSON to your "links" array
function socialsToLinks(website, socials, email) {
  const links = [];

  if (website) {
    links.push({ label: "Website", url: website });
  }
  if (email) {
    links.push({ label: "Email", url: email });
  }
  if (socials) {
    if (socials.instagram) {
      links.push({ label: "Instagram", url: socials.instagram });
    }
    if (socials.twitter) {
      links.push({ label: "Twitter", url: socials.twitter });
    }
    if (socials.linkedin) {
      links.push({ label: "LinkedIn", url: socials.linkedin });
    }
    if (socials.snapchat) {
      links.push({ label: "Snapchat", url: socials.snapchat });
    }
  }

  return links;
}

// UNIFIED PROFILE FUNCTION - works for both own profile and others
export async function getProfileByUsername(username) {
  if (!username || typeof username !== "string") {
    return null;
  }

  const currentUser = await getCurrentUser();

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

  if (!profile) {
    return null;
  }

  const isOwnProfile = currentUser?.id === profile.id;

  // Fetch posts
  const posts = await prisma.post.findMany({
    where: {
      userId: profile.id,
      type: "PHOTO",
      photo: {
        isNot: null,
      },
    },
    include: {
      photo: true,
      likes: true,
      repostActions: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch reposts
  const reposts = await prisma.post.findMany({
    where: {
      userId: profile.id,
      type: "REPOST",
      originalPost: {
        photo: {
          isNot: null,
        },
      },
    },
    include: {
      originalPost: {
        include: {
          photo: true,
          likes: true,
          repostActions: true,
          user: {
            include: {
              profile: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Transform posts
  const transformedPosts = posts.map((post) => ({
    id: post.id,
    image: post.photo?.thumbUrl || post.photo?.url || "",
    fullImage: post.photo?.url || "",
    caption: post.photo?.caption || post.caption || "",
    tags: post.photo?.tags || [],
    likes: post.likes?.length || 0,
    reposts: post.repostActions?.length || 0,
    liked: currentUser
      ? post.likes?.some((like) => like.userId === currentUser.id)
      : false,
    reposted: currentUser
      ? post.repostActions?.some((r) => r.userId === currentUser.id)
      : false,
    createdAt: post.createdAt,
  }));

  // Transform reposts
  const transformedReposts = reposts
    .filter((repost) => repost.originalPost)
    .map((repost) => {
      const original = repost.originalPost;
      return {
        id: original.id,
        image: original.photo?.thumbUrl || original.photo?.url || "",
        fullImage: original.photo?.url || "",
        caption: original.photo?.caption || original.caption || "",
        tags: original.photo?.tags || [],
        likes: original.likes?.length || 0,
        reposts: original.repostActions?.length || 0,
        liked: currentUser
          ? original.likes?.some((like) => like.userId === currentUser.id)
          : false,
        reposted: currentUser
          ? original.repostActions?.some((r) => r.userId === currentUser.id)
          : false,
        createdAt: original.createdAt,
        repostedAt: repost.createdAt,
      };
    });

  // Get follow counts
  const followingCount = await prisma.follow.count({
    where: { followerId: profile.id },
  });

  const followerCount = await prisma.follow.count({
    where: { followingId: profile.id },
  });

  // Check if current user is following this profile
  const isFollowing = currentUser
    ? await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId: profile.id,
          },
        },
      })
    : null;

  // Include email only if viewing own profile
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