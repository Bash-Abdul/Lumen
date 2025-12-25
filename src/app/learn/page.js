// import Link from "next/link";
// import BlogCard from "../../features/blog/components/BlogCard";
// import Button from "../../shared/ui/Button";
// import Avatar from "@/shared/ui/Avatar";
// import { getAllPosts } from "@/server/services/blog";

// export const revalidate = 60; // seconds

// export default async function LearnPage() {
  
//    let posts = [];

//   try {
//   posts = await getAllPosts();
//   } catch (error) {
//     console.error("Failed to load blogs for Learn page", error);
//   }


//   if (!posts || posts.length === 0) {
//     return (
//       <div className="space-y-6">
//         <div className="flex items-center justify-between flex-wrap gap-4">
//           <div>
//             <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
//               Learn
//             </p>
//             <h1 className="text-3xl font-semibold">Blog & how-tos</h1>
//             <p className="text-sm text-zinc-400">
//               Stories, lighting breakdowns, and creative business notes.
//             </p>
//           </div>
//           <div className="flex gap-2">
//             <Button href="/learn/my-posts" variant="secondary">
//               My posts
//             </Button>
//             <Button href="/learn/new">Create post</Button>
//           </div>
//         </div>

//         <p className="text-sm text-zinc-400">No posts yet.</p>
//       </div>
//     );
//   }

//   const [latestPost, ...otherPosts] = posts;

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between flex-wrap gap-4">
//         <div>
//           <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
//             Learn
//           </p>
//           <h1 className="text-3xl font-semibold">Blog & how-tos</h1>
//           <p className="text-sm text-zinc-400">
//             Stories, lighting breakdowns, and creative business notes.
//           </p>
//         </div>
//         <div className="flex gap-2">
//           <Button href="/learn/my-posts" variant="secondary">
//             My posts
//           </Button>
//           <Button href="/learn/new">Create post</Button>
//         </div>
//       </div>

//       {/* Featured / latest post */}
//       <div>
//         <h2 className="text-sm font-medium text-zinc-400 mb-2">Latest post</h2>

//         <Link
//           href={`/learn/${latestPost.slug}`}
//           className="card overflow-hidden p-0 flex flex-col md:flex-row-reverse"
//         >
//           {/* Image side */}
//           <div className="md:w-1/2 w-full">
//             {/* eslint-disable-next-line @next/next/no-img-element */}
//             <img
//               src={latestPost.cover}
//               alt={latestPost.title}
//               className="w-full h-64 md:h-full object-cover"
//               loading="lazy"
//             />
//           </div>

//           {/* Text side */}
//           <div className="md:w-1/2 w-full p-5 md:p-6 flex flex-col justify-between gap-4">
//             <div className="space-y-3">
//               <div className="flex items-center gap-3">
//                 <Avatar src={latestPost.author?.avatar} size={36} />
//                 <div>
//                   <p className="text-sm text-zinc-200">
//                     {latestPost.author?.name || "Unknown author"}
//                   </p>
//                   <p className="text-xs text-zinc-500">
//                     {latestPost.publishedAt}
//                   </p>
//                 </div>
//               </div>

//               <h3 className="text-xl font-semibold leading-tight">
//                 {latestPost.title}
//               </h3>

//               <p className="text-sm text-zinc-300 line-clamp-3">
//                 {latestPost.excerpt}
//               </p>
//             </div>

//             {latestPost.tags?.length > 0 && (
//               <div className="flex gap-2 flex-wrap">
//                 {latestPost.tags.map((tag) => (
//                   <span
//                     key={tag}
//                     className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1"
//                   >
//                     {tag}
//                   </span>
//                 ))}
//               </div>
//             )}
//           </div>
//         </Link>
//       </div>

//       {/* Remaining posts below in grid */}
//       {otherPosts.length > 0 && (
//         <div className="space-y-3">
//           {/* <h2 className="text-sm font-medium text-zinc-400">
//             More from the blog
//           </h2> */}
//           <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
//             {otherPosts.map((post) => (
//               <BlogCard key={post.slug} post={post} />
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// ============================================
// 1. Main Learn Page (More Visual, Magazine Style)
// ============================================
import Link from "next/link";
import BlogCard from "../../features/blog/components/BlogCard";
import Button from "../../shared/ui/Button";
import Avatar from "@/shared/ui/Avatar";
// import { getAllPosts } from "@/server/services/blog";
import { getAllPosts } from "@/features/blog/services/blogService";

export const revalidate = 60;

export default async function LearnPage() {
  let posts = [];

  try {
    posts = await getAllPosts();
  } catch (error) {
    console.error("Failed to load blogs for Learn page", error);
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300 mb-2">
              Learn
            </p>
            <h1 className="text-4xl font-bold">Stories & Tutorials</h1>
            <p className="text-zinc-400 mt-2">
              Behind-the-scenes, lighting breakdowns, and creative business notes.
            </p>
          </div>
          <div className="flex gap-2">
            <Button href="/learn/my-posts" variant="secondary">
              My posts
            </Button>
            <Button href="/learn/new">Write</Button>
          </div>
        </div>

        <div className="card p-12 text-center space-y-4">
          <div className="text-6xl">📝</div>
          <p className="text-zinc-400">No posts yet. Be the first to share your story.</p>
          <Button href="/learn/new">Create First Post</Button>
        </div>
      </div>
    );
  }

  const [featured, ...otherPosts] = posts;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300 mb-2">
            Learn
          </p>
          <h1 className="text-4xl font-bold">Stories & Tutorials</h1>
          <p className="text-zinc-400 mt-2">
            Behind-the-scenes, lighting breakdowns, and creative business notes.
          </p>
        </div>
        <div className="flex gap-2">
          <Button href="/learn/my-posts" variant="secondary">
            My posts
          </Button>
          <Button href="/learn/new">Write</Button>
        </div>
      </div>

      {/* Featured Post - Large Hero */}
      <Link
        href={`/learn/${featured.slug}`}
        className="group relative block overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:border-emerald-500/50 transition-all duration-300"
      >
        <div className="relative h-[500px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={featured.cover}
            alt={featured.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />
          
          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
            {/* Tags */}
            {featured.tags?.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {featured.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-emerald-300 bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-full px-3 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
              {featured.title}
            </h2>

            <p className="text-zinc-200 text-lg line-clamp-2 max-w-3xl">
              {featured.excerpt}
            </p>

            {/* Author */}
            <div className="flex items-center gap-3">
              <Avatar src={featured.author?.avatar} size={40} />
              <div>
                <p className="text-sm text-white font-medium">
                  {featured.author?.name || "Unknown"}
                </p>
                <p className="text-xs text-zinc-400">
                  {featured.publishedAt}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Grid Posts */}
      {otherPosts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">More Stories</h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {otherPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

