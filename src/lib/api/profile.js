// import { users } from "../mockData/users";
// import { posts } from "../mockData/posts";
// import { blogs } from "../mockData/blogs";
// import api from "../api";

// export async function getProfile(username) {
//   // TODO: replace with GET /api/users/:username
//   const user = users.find((u) => u.username === username);
//   if (!user) return null;
//   const userPosts = posts.filter((p) => p.username === username);
//   const userReposts = posts.filter(
//     (p) => p.username !== username && p.reposted
//   );
//   const userBlogs = blogs.filter((b) =>
//     b.author?.name?.toLowerCase().includes(user.name.toLowerCase())
//   );
//   return Promise.resolve({
//     ...user,
//     posts: userPosts,
//     reposts: userReposts,
//     blogs: userBlogs,
//   });
// }

// export async function updateProfile(username, payload) {
//   // TODO: replace with PATCH /api/users/:username
//   const existing = users.find((u) => u.username === username);
//   if (!existing) return null;
//   const updated = { ...existing, ...payload };
//   return Promise.resolve(updated);
// }

// import api from "@/lib/api"
import api from "../api"

// Map backend socials JSON to your "links" array
function socialsToLinks(website, socials, email) {
  const links = []

  if (website) {
    links.push({ label: "Website", url: website })
  }
  if (email) {
    links.push({ label: "Email", url: email })
  }
  if (socials) {
    if (socials.instagram) {
      links.push({ label: "Instagram", url: socials.instagram })
    }
    if (socials.twitter) {
      links.push({ label: "Twitter", url: socials.twitter })
    }
    if (socials.linkedin) {
      links.push({ label: "LinkedIn", url: socials.linkedin })
    }
    if (socials.snapchat) {
      links.push({ label: "Snapchat", url: socials.snapchat })
    }
  }

  return links
}

// Reverse mapping from your form profile back to backend shape
function profileToBackendPayload(updatedProfile) {
  const socials = {}

  if (updatedProfile.links && Array.isArray(updatedProfile.links)) {
    for (const link of updatedProfile.links) {
      const label = link.label.toLowerCase()
      const url = link.url

      if (label.includes("instagram")) socials.instagram = url
      if (label.includes("twitter")) socials.twitter = url
      if (label.includes("linkedin")) socials.linkedin = url
      if (label.includes("snap")) socials.snapchat = url
      if (label.includes("site") || label.includes("web")) {
        // website handled separately below
      }
    }
  }

  // website is coming from `form.website` on the page
  return {
    displayName: updatedProfile.name || null,
    username: updatedProfile.username || null,
    bio: updatedProfile.bio || null,
    avatarUrl: updatedProfile.avatar || null,
    website:
      updatedProfile.website ||
      updatedProfile.links?.find((l) =>
        l.label.toLowerCase().includes("site")
      )?.url ||
      null,
    socials: Object.keys(socials).length > 0 ? socials : null,
  }
}

// front end: getProfile(username) but we ignore username, backend uses auth user
export async function getProfile(username) {
  try {
    const res = await api.get("/profile")
    const { ok, profile } = res.data

    if (!ok) {
      throw new Error(res.data?.message || "Failed to load profile")
    }

    const links = socialsToLinks(profile.website, profile.socials, profile.email)

    // Shape it to what your ProfilePage expects
    return {
      // name/title
      name: profile.displayName || "",
      username: profile.username,
      avatar: profile.avatarUrl,
      bio: profile.bio || "",
      email: profile.email || "",
      links,

      // keep the mock stuff simple for now
      posts: [], // you can keep your mock posts if you have them elsewhere
      reposts: [],
      counters: {
        followers: 0,
        following: 0,
      },
    }
  } catch (err) {
    console.error("getProfile error", err)
    throw err
  }
}

export async function updateProfile(username, updatedProfile) {
  try {
    const payload = profileToBackendPayload(updatedProfile)

    const res = await api.patch("/profile", payload)
    const { ok, profile } = res.data

    if (!ok) {
      throw new Error(res.data?.message || "Failed to update profile")
    }

    const links = socialsToLinks(profile.website, profile.socials, profile.email)

    // return new profile in the same front end shape
    return {
      name: profile.displayName || "",
      username: profile.username,
      avatar: profile.avatarUrl,
      bio: profile.bio || "",
      email: profile.email || "",
      links,
      posts: updatedProfile.posts || [],
      reposts: updatedProfile.reposts || [],
      counters: updatedProfile.counters || {
        followers: 0,
        following: 0,
      },
    }
  } catch (err) {
    console.error("updateProfile error", err)
    throw err
  }
}
