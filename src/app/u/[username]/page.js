// import ProfileTabs from "../../../features/profile/components/ProfileTabs";
// import PostCard from "../../../features/feed/components/PostCard";
// import BlogCard from "../../../features/blog/components/BlogCard";
// import Avatar from "../../../shared/ui/Avatar";
// import { getProfile } from "../../../shared/lib/api/profile";

// function ImageGrid({ items = [] }) {
//   return (
//     <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
//       {items.map((item) => (
//         <div key={item.id} className="break-inside-avoid">
//           {/* eslint-disable-next-line @next/next/no-img-element */}
//           <img
//             src={item.image}
//             alt={item.caption}
//             className="w-full h-auto object-cover block"
//             loading="lazy"
//           />
//         </div>
//       ))}
//     </div>
//   );
// }

// function LinksModal({ open, onClose, links = [] }) {
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
//       <div className="card p-6 w-full max-w-md space-y-4">
//         <div className="flex items-center justify-between">
//           <h3 className="text-lg font-semibold">Links & socials</h3>
//           <button
//             onClick={onClose}
//             className="text-sm text-zinc-400 hover:text-white"
//           >
//             Close
//           </button>
//         </div>
//         {links.length ? (
//           <div className="space-y-3 text-sm">
//             {links.map((link) => (
//               <a
//                 key={link.url}
//                 href={link.url}
//                 className="flex items-center justify-between px-3 py-2 rounded-lg border border-zinc-800 hover:border-emerald-400 bg-zinc-900/60"
//                 target="_blank"
//                 rel="noreferrer"
//               >
//                 <span>{link.label}</span>
//                 <span className="text-xs text-zinc-400 break-all">{link.url}</span>
//               </a>
//             ))}
//           </div>
//         ) : (
//           <p className="text-xs text-zinc-500">No links added.</p>
//         )}
//       </div>
//     </div>
//   );
// }

// function ProfileContent({ profile }) {
//   "use client";
//   const { useState } = require("react");
//   const [tab, setTab] = useState("photos");
//   const [showLinks, setShowLinks] = useState(false);

//   const links = [
//     ...(profile.links || []),
//     profile.email && { label: "Email", url: `mailto:${profile.email}` },
//   ].filter(Boolean);

//   return (
//     <div className="space-y-5">
//       <div className="flex items-center justify-between gap-4">
//         <div className="flex items-center gap-4">
//           <Avatar src={profile.avatar} size={80} />
//           <div>
//             <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Profile</p>
//             <h1 className="text-3xl font-semibold">{profile.name}</h1>
//             <p className="text-sm text-zinc-400">@{profile.username}</p>
//             {profile.location && (
//               <p className="text-xs text-zinc-500">{profile.location}</p>
//             )}
//           </div>
//         </div>
//         {links.length > 0 && (
//           <button
//             className="text-sm text-emerald-300 underline decoration-dotted"
//             onClick={() => setShowLinks(true)}
//           >
//             View links & socials
//           </button>
//         )}
//       </div>

//       {profile.bio && <p className="text-sm text-zinc-300 max-w-3xl">{profile.bio}</p>}

//       <div className="flex gap-6 text-sm text-zinc-300">
//         <span>
//           <strong className="text-white">{profile.counters?.photos || 0}</strong> photos
//         </span>
//         <span>
//           <strong className="text-white">{profile.counters?.followers || 0}</strong> followers
//         </span>
//         <span>
//           <strong className="text-white">{profile.counters?.following || 0}</strong> following
//         </span>
//       </div>

//       <ProfileTabs active={tab} onChange={setTab} />

//       {tab === "photos" && (
//         profile.posts?.length ? (
//           <ImageGrid items={profile.posts} />
//         ) : (
//           <p className="text-sm text-zinc-400">No posts yet.</p>
//         )
//       )}

//       {tab === "reposts" && (
//         <div className="grid gap-4">
//           {profile.reposts?.length ? (
//             profile.reposts.map((post) => <PostCard key={post.id} post={post} />)
//           ) : (
//             <p className="text-sm text-zinc-400">No reposts yet.</p>
//           )}
//         </div>
//       )}

//       {tab === "blogs" && (
//         <div className="grid md:grid-cols-2 gap-4">
//           {profile.blogs?.length ? (
//             profile.blogs.map((b) => <BlogCard key={b.slug} post={b} />)
//           ) : (
//             <p className="text-sm text-zinc-400">No blog posts yet.</p>
//           )}
//         </div>
//       )}

//       <LinksModal open={showLinks} onClose={() => setShowLinks(false)} links={links} />
//     </div>
//   );
// }

// export default async function PublicProfilePage({ params }) {
//   const profile = await getProfile(params.username);
//   if (!profile) {
//     return (
//       <div className="card p-6">
//         <p className="text-sm text-zinc-300">Profile not found.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <ProfileContent profile={profile} />
//     </div>
//   );
// }


// app/u/[username]/page.js
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/server/auth/auth-server";
import { getPublicProfile } from "@/server/services/profile";
import PublicProfileClient from "./PublicProfileClient";

export default async function PublicProfilePage({ params }) {
  const resolvedParams = await params;
  const username = resolvedParams.username;

  const profile = await getPublicProfile(username);

  if (!profile) {
    notFound();
  }

  // Check if viewing own profile
  // const currentUser = await getCurrentUser();
  // const isOwnProfile = currentUser?.id === profile.id;

  return (
    <PublicProfileClient 
      profile={profile} 
      // isOwnProfile={isOwnProfile}
    />
  );
}

// Optional: Generate metadata for SEO
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const profile = await getPublicProfile(resolvedParams.username);

  if (!profile) {
    return {
      title: "User not found",
    };
  }

  return {
    title: `${profile.name} (@${profile.username})`,
    description: profile.bio || `View ${profile.name}'s profile`,
  };
}
