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
  
    const links = socialsToLinks(
      profile.website,
      profile.socials,
      profile.user?.email
    );
  
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
      // Mock data for now
      posts: [],
      reposts: [],
      counters: {
        followers: 0,
        following: 0,
      },
    };
  }

  