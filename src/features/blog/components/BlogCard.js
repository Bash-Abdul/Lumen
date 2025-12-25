// "use client";

// import Link from "next/link";
// import Avatar from "@/shared/ui/Avatar";

// export default function BlogCard({ post }) {
//   return (
//     <Link href={`/learn/${post.slug}`} className="card overflow-hidden block">
//       <div className="h-56 w-full overflow-hidden">
//         {/* eslint-disable-next-line @next/next/no-img-element */}
//         <img
//           src={post.cover}
//           alt={post.title}
//           className="w-full h-full object-cover"
//           loading="lazy"
//         />
//       </div>

//       <div className="">
//         <div className="p-4 space-y-3">
//           <div className="flex items-center gap-3">
//             <Avatar src={post.author?.avatar} size={36} />
//             <div>
//               <p className="text-sm text-zinc-200">{post.author?.name}</p>
//               <p className="text-xs text-zinc-500">{post.published}</p>
//               <p className="text-xs text-zinc-500">{post.publishedAt}</p>
//             </div>
//           </div>
//           <h3 className="text-lg font-semibold leading-tight">{post.title}</h3>
//           <p className="text-sm text-zinc-300 line-clamp-2">{post.excerpt}</p>
//           <div className="flex gap-2 flex-wrap">
//             {post.tags?.map((tag) => (
//               <span
//                 key={tag}
//                 className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1"
//               >
//                 {tag}
//               </span>
//             ))}
//           </div>
//         </div>
//       </div>
//     </Link>
//   );
// }


"use client";

import Link from "next/link";
import Avatar from "@/shared/ui/Avatar";

export default function BlogCard({ post }) {
  return (
    <Link
      href={`/learn/${post.slug}`}
      className="group block overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-emerald-500/50 transition-all duration-300"
    >
      {/* Image with overlay on hover */}
      <div className="relative h-64 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.cover}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className="text-xl font-bold leading-tight group-hover:text-emerald-400 transition-colors">
          {post.title}
        </h3>

        <p className="text-sm text-zinc-400 line-clamp-2">{post.excerpt}</p>

        {/* Author */}
        <div className="flex items-center gap-3 pt-2 border-t border-zinc-800">
          <Avatar src={post.author?.avatar} size={32} />
          <div>
            <p className="text-sm text-zinc-200">{post.author?.name}</p>
            <p className="text-xs text-zinc-500">{post.publishedAt}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}