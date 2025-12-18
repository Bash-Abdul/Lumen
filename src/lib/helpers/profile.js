import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";

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





// GET MY PROFILE DATA
export async function getProfile() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  const profile = await prisma.profile.findUnique({
    where: { id: currentUser.id },
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
        },
      },
    },
  });

  if (!profile) {
    return null;
  }

  // ✅ FETCH USER'S POSTS (PHOTO type only)
  const posts = await prisma.post.findMany({
    where: {
      userId: currentUser.id,
      type: "PHOTO",
      photo: {
        isNot: null, // Must have a photo
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

  // ✅ FETCH USER'S REPOSTS
  const reposts = await prisma.post.findMany({
    where: {
      userId: currentUser.id,
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

  // ✅ TRANSFORM POSTS to match ImageGrid format
  const transformedPosts = posts.map((post) => ({
    id: post.id,
    image: post.photo?.thumbUrl || post.photo?.url || "",
    fullImage: post.photo?.url || "",
    caption: post.photo?.caption || post.caption || "",
    tags: post.photo?.tags || [],
    likes: post.likes?.length || 0,
    reposts: post.repostActions?.length || 0,
    liked: post.likes?.some((like) => like.userId === currentUser.id) || false,
    reposted: post.repostActions?.some((r) => r.userId === currentUser.id) || false,
    createdAt: post.createdAt,
  }));

  // ✅ TRANSFORM REPOSTS
  const transformedReposts = reposts
    .filter((repost) => repost.originalPost) // Safety check
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
        liked: original.likes?.some((like) => like.userId === currentUser.id) || false,
        reposted: true, // Always true in reposts tab
        createdAt: original.createdAt,
        repostedAt: repost.createdAt,
      };
    });

  // ✅ GET FOLLOW COUNTS
  const followingCount = await prisma.follow.count({
    where: { followerId: currentUser.id },
  });

  const followerCount = await prisma.follow.count({
    where: { followingId: currentUser.id },
  });

  const links = socialsToLinks(
    profile.website,
    profile.socials,
    profile.user?.email
  );

  // Get stats from profile or calculate
  const profileStats = profile.stats || {};

  // Shape it for the frontend
  return {
    id: profile.id,
    name: profile.displayName || "",
    username: profile.username,
    avatar: profile.avatarUrl,
    bio: profile.bio || "",
    location: profile.location || "",
    email: profile.user?.email || "",
    website: profile.website || "",
    socials: profile.socials || {},
    links,
    posts: transformedPosts, // ✅ REAL DATA!
    reposts: transformedReposts, // ✅ REAL DATA!
    counters: {
      photos: transformedPosts.length,
      reposts: transformedReposts.length,
      likes: profileStats.likeCount || 0,
      repostsReceived: profileStats.repostCount || 0,
      followers: followerCount,
      following: followingCount,
    },
  };
}


// lib/helpers/profile.js (add this function)

// GET PROFILE FOR ANYONE WITH AN ACCOUNT
export async function getPublicProfile(username) {
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
      // createdAt: true, 
      user: {
        select: { 
          createdAt: true,
        },
      },
    },
  });

  if (!profile) {
    return null;
  }

   // Fetch this user's posts
   const posts = await prisma.post.findMany({
    where: {
      userId: profile.id,
      type: "PHOTO",
      photo: {
        isNot: null,
        // visibility: "PUBLIC", // Only show public posts
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

  // Fetch this user's reposts
  const reposts = await prisma.post.findMany({
    where: {
      userId: profile.id,
      type: "REPOST",
      originalPost: {
        photo: {
          isNot: null,
          // visibility: "PUBLIC",
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

  const links = socialsToLinks(profile.website, profile.socials, null); // No email for public

  const profileStats = profile.stats || {}; 

  return {
    id: profile.id,
    userId: profile.id,
    name: profile.displayName || profile.username,
    username: profile.username,
    avatar: profile.avatarUrl,
    bio: profile.bio || "",
    location: profile.location || "",
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
      // ✅ FIXED: Add viewer object that PublicProfileClient expects
      viewer: {
        isAuthenticated: !!currentUser,
        isFollowing: !!isFollowing,
        isOwnProfile: currentUser?.id === profile.id,
      },
    // isFollowing: !!isFollowing,
    // isOwnProfile: currentUser?.id === profile.id,
  };
}