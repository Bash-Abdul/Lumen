// // app/[username]/media/[photoId]/PhotoDetailClient.js
// "use client";

// import { useState, useTransition } from "react";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import Link from "next/link";
// import Avatar from "@/shared/ui/Avatar";
// import Button from "@/shared/ui/Button";
// import { likePost, repostPost } from "@/server/actions/postActions";

// function buildSearch({ galleryData, from, returnTo }) {
//   const sp = new URLSearchParams();
//   if (from) sp.set("from", from);
//   if (returnTo) sp.set("returnTo", returnTo);
//   if (galleryData?.length) sp.set("gallery", galleryData.join(","));
//   const qs = sp.toString();
//   return qs ? `?${qs}` : "";
// }

// // export default function PhotoDetailClient({ post, galleryData = [], origin = 'profile' }) 
// export default function PhotoDetailClient({
//   post,
//   galleryData = [],
//   from = null,
//   returnTo = null,
// }) {
//   const router = useRouter();
//   const [isPending, startTransition] = useTransition();

//   const [likes, setLikes] = useState(post.likes);
//   const [reposts, setReposts] = useState(post.reposts);
//   const [liked, setLiked] = useState(post.liked);
//   const [reposted, setReposted] = useState(post.reposted);

//     // Parse gallery data (format: "id:username,id:username,...")
//     const gallery = galleryData.map(item => {
//       const [id, username] = item.split(':');
//       return { id, username };
//     });

//       // Find current position in gallery
//   const currentIndex = gallery.findIndex(item => item.id === post.id);
//   const hasPrev = currentIndex > 0;
//   const hasNext = currentIndex < gallery.length - 1;
//   const prevItem = hasPrev ? gallery[currentIndex - 1] : null;
//   const nextItem = hasNext ? gallery[currentIndex + 1] : null;

//     // // Find current position in gallery
//     // const currentIndex = galleryIds.indexOf(post.id);
//     // const hasPrev = currentIndex > 0;
//     // const hasNext = currentIndex < galleryIds.length - 1;
//     // const prevId = hasPrev ? galleryIds[currentIndex - 1] : null;
//     // const nextId = hasNext ? galleryIds[currentIndex + 1] : null;

//     // Determine where to go when closing
//   const handleClose = () => {
//     if (origin === 'feed') {
//       router.push('/feed');
//     } else {
//       router.push(`/${post.username}`);
//     }
//   };

  
//   // Navigate to prev/next photo
//   // const handleNavigation = (item) => {
//   //   const galleryParam = galleryData.length > 0 ? `gallery=${galleryData.join(',')}` : '';
//   //   const fromParam = origin ? `&from=${origin}` : '';
//   //   router.push(`/${item.username}/media/${item.id}?${galleryParam}${fromParam}`);
//   // };

//   const handleNavigation = (item) => {
//     const galleryParam = galleryData.length > 0 ? `?gallery=${galleryData.join(',')}&from=${origin}` : `?from=${origin}`;
//     window.location.href = `/${item.username}/media/${item.id}${galleryParam}`;
//   };

  
//   const handleLike = () => {
//     const newLiked = !liked;
//     setLiked(newLiked);
//     setLikes((prev) => prev + (newLiked ? 1 : -1));

//     startTransition(async () => {
//       const result = await likePost(post.id);

//       if (result?.error) {
//         setLiked(!newLiked);
//         setLikes((prev) => prev + (newLiked ? -1 : 1));
//         toast.error(result.error);
//         return;
//       }

//       if (result?.success) {
//         setLiked(result.liked);
//         setLikes(result.likeCount);
//       }
//     });
//   };

//   const handleRepost = () => {
//     const newReposted = !reposted;
//     setReposted(newReposted);
//     setReposts((prev) => prev + (newReposted ? 1 : -1));

//     startTransition(async () => {
//       const result = await repostPost(post.id);

//       if (result?.error) {
//         setReposted(!newReposted);
//         setReposts((prev) => prev + (newReposted ? -1 : 1));
//         toast.error(result.error);
//         return;
//       }

//       if (result?.success) {
//         setReposted(result.reposted);
//         setReposts(result.repostCount);
//         toast.success(newReposted ? "Reposted!" : "Repost removed");
//       }
//     });
//   };

//   const handleReport = () => {
//     toast.info("Report feature coming soon");
//   };

//   const formatDate = (date) => {
//     const d = new Date(date);
//     return d.toLocaleDateString("en-US", {
//       month: "long",
//       day: "numeric",
//       year: "numeric",
//     });
//   };

//   const formatTime = (date) => {
//     const d = new Date(date);
//     return d.toLocaleTimeString("en-US", {
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   return (
//     <div className="fixed inset-0 bg-black z-50 flex">
//       {/* Close button */}
//       <button
//         onClick={handleClose}
//         className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white transition-colors"
//         aria-label="Close"
//       >
//         <svg
//           className="w-6 h-6"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M6 18L18 6M6 6l12 12"
//           />
//         </svg>
//       </button>

//       {/* Image section */}
//       <div className="flex-1 flex items-center justify-center p-8 relative">
//         <img
//           src={post.fullImage || post.image}
//           alt={post.caption || "Photo"}
//           className="max-w-full max-h-full object-contain"
//         />

//                {/* Previous button */}
//                {hasPrev && prevItem && (
//           <button
//             onClick={() => handleNavigation(prevItem)}
//             className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-white transition-colors border border-zinc-700"
//             aria-label="Previous"
//           >
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//             </svg>
//           </button>
//         )}

//         {/* Next button */}
//         {hasNext && nextItem && (
//           <button
//             onClick={() => handleNavigation(nextItem)}
//             className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-white transition-colors border border-zinc-700"
//             aria-label="Next"
//           >
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//             </svg>
//           </button>
//         )}
//       </div>

//       {/* Sidebar */}
//       <div className="w-96 bg-zinc-950 border-l border-zinc-800 flex flex-col">
//         {/* Creator info */}
//         <div className="p-6 border-b border-zinc-800">
//           <Link
//             href={`/${post.username}`}
//             className="flex items-center gap-3 hover:opacity-80 transition-opacity"
//           >
//             <Avatar src={post.avatar} size={48} />
//             <div>
//               <p className="font-semibold text-white">{post.photographerName}</p>
//               <p className="text-sm text-zinc-400">@{post.username}</p>
//             </div>
//           </Link>
//         </div>

//         {/* Caption and tags */}
//         <div className="flex-1 overflow-y-auto p-6 space-y-4">
//           {post.caption && (
//             <div>
//               <p className="text-sm text-zinc-200">{post.caption}</p>
//             </div>
//           )}

//           {post.tags && post.tags.length > 0 && (
//             <div className="flex flex-wrap gap-2">
//               {post.tags.map((tag) => (
//                 <span
//                   key={tag}
//                   className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1"
//                 >
//                   {tag}
//                 </span>
//               ))}
//             </div>
//           )}

//           {post.location && (
//             <div className="flex items-center gap-2 text-sm text-zinc-400">
//               <svg
//                 className="w-4 h-4"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
//                 />
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
//                 />
//               </svg>
//               <span>{post.location}</span>
//             </div>
//           )}

//           {/* Date and time */}
//           <div className="pt-4 border-t border-zinc-800 space-y-1">
//             <p className="text-xs text-zinc-500">{formatDate(post.createdAt)}</p>
//             <p className="text-xs text-zinc-500">{formatTime(post.createdAt)}</p>
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="p-6 border-t border-zinc-800 space-y-3">
//           <div className="flex items-center gap-2">
//             <Button
//               variant={liked ? "primary" : "secondary"}
//               size="sm"
//               onClick={handleLike}
//               disabled={isPending}
//               className="flex-1"
//             >
//               ♥ {likes} {likes === 1 ? "Like" : "Likes"}
//             </Button>
//             <Button
//               variant={reposted ? "primary" : "secondary"}
//               size="sm"
//               onClick={handleRepost}
//               disabled={isPending}
//               className="flex-1"
//             >
//               ↻ {reposts} {reposts === 1 ? "Repost" : "Reposts"}
//             </Button>
//           </div>

//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={handleReport}
//             className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
//           >
//             Report
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import Avatar from "@/shared/ui/Avatar";
import Button from "@/shared/ui/Button";
import { likePost, repostPost } from "@/server/actions/postActions";

function buildSearch({ galleryData, from, returnTo }) {
  const sp = new URLSearchParams();
  if (from) sp.set("from", from);
  if (returnTo) sp.set("returnTo", returnTo);
  if (galleryData?.length) sp.set("gallery", galleryData.join(","));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export default function PhotoDetailClient({
  post,
  galleryData = [],
  from = null,
  returnTo = null,
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [likes, setLikes] = useState(post.likes);
  const [reposts, setReposts] = useState(post.reposts);
  const [liked, setLiked] = useState(post.liked);
  const [reposted, setReposted] = useState(post.reposted);

  // Parse gallery items: "id:username"
  const gallery = useMemo(() => {
    return (galleryData || [])
      .map((raw) => {
        const [id, username] = String(raw).split(":");
        if (!id) return null;
        return { id, username: username || null };
      })
      .filter(Boolean);
  }, [galleryData]);

  const currentIndex = useMemo(() => {
    return gallery.findIndex((item) => item.id === post.id);
  }, [gallery, post.id]);

  const prevItem = currentIndex > 0 ? gallery[currentIndex - 1] : null;
  const nextItem =
    currentIndex >= 0 && currentIndex < gallery.length - 1
      ? gallery[currentIndex + 1]
      : null;

  const search = useMemo(
    () => buildSearch({ galleryData, from, returnTo }),
    [galleryData, from, returnTo]
  );

  const handleClose = () => {
    // If user came from feed or profile page in-app, go back to restore scroll and state
    if (from) {
      router.back();
      return;
    }

    // Direct entry fallback
    if (returnTo) {
      router.push(returnTo);
      return;
    }

    router.push(`/${post.username}`);
  };

  const handleNavigation = (item) => {
    if (!item?.id) return;

    // We need username for the URL, fallback to current post username if missing
    const username = item.username || post.username;

    // Replace, so close goes back to the original page, not to previous photo
    router.replace(`/${username}/media/${item.id}${search}`);
  };

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes((prev) => prev + (newLiked ? 1 : -1));

    startTransition(async () => {
      const result = await likePost(post.id);

      if (result?.error) {
        setLiked(!newLiked);
        setLikes((prev) => prev + (newLiked ? -1 : 1));
        toast.error(result.error);
        return;
      }

      if (result?.success) {
        setLiked(result.liked);
        setLikes(result.likeCount);
      }
    });
  };

  const handleRepost = () => {
    const newReposted = !reposted;
    setReposted(newReposted);
    setReposts((prev) => prev + (newReposted ? 1 : -1));

    startTransition(async () => {
      const result = await repostPost(post.id);

      if (result?.error) {
        setReposted(!newReposted);
        setReposts((prev) => prev + (newReposted ? -1 : 1));
        toast.error(result.error);
        return;
      }

      if (result?.success) {
        setReposted(result.reposted);
        setReposts(result.repostCount);
        toast.success(newReposted ? "Reposted!" : "Repost removed");
      }
    });
  };

  const handleReport = () => toast.info("Report feature coming soon");

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <div className="fixed inset-0 bg-black z-50 flex">
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white transition-colors"
        aria-label="Close"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex-1 flex items-center justify-center p-8 relative">
        <img
          src={post.fullImage || post.image}
          alt={post.caption || "Photo"}
          className="max-w-full max-h-full object-contain"
        />

        {prevItem && (
          <button
            onClick={() => handleNavigation(prevItem)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-white transition-colors border border-zinc-700"
            aria-label="Previous"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {nextItem && (
          <button
            onClick={() => handleNavigation(nextItem)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-white transition-colors border border-zinc-700"
            aria-label="Next"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      <div className="w-96 bg-zinc-950 border-l border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <Link href={`/${post.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Avatar src={post.avatar} size={48} />
            <div>
              <p className="font-semibold text-white">{post.photographerName}</p>
              <p className="text-sm text-zinc-400">@{post.username}</p>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {post.caption && <p className="text-sm text-zinc-200">{post.caption}</p>}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {post.location && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span>{post.location}</span>
            </div>
          )}

          <div className="pt-4 border-t border-zinc-800 space-y-1">
            <p className="text-xs text-zinc-500">{formatDate(post.createdAt)}</p>
            <p className="text-xs text-zinc-500">{formatTime(post.createdAt)}</p>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-800 space-y-3">
          <div className="flex items-center gap-2">
            <Button
              variant={liked ? "primary" : "secondary"}
              size="sm"
              onClick={handleLike}
              disabled={isPending}
              className="flex-1"
            >
              ♥ {likes} {likes === 1 ? "Like" : "Likes"}
            </Button>

            <Button
              variant={reposted ? "primary" : "secondary"}
              size="sm"
              onClick={handleRepost}
              disabled={isPending}
              className="flex-1"
            >
              ↻ {reposts} {reposts === 1 ? "Repost" : "Reposts"}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReport}
            className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            Report
          </Button>
        </div>
      </div>
    </div>
  );
}
