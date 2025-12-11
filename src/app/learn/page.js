// import Link from "next/link";
// import BlogCard from "../../components/blog/BlogCard";
// import Button from "../../components/common/Button";
// import { getBlogs } from "../../lib/api/blog";

// export default async function LearnPage() {
//   const posts = await getBlogs();
//   const latestpost = posts[0];

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
//         <Button href="/learn/new">
//           Create post
//         </Button>
//       </div>

//       <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
//         {posts.map((post) => (
//           <BlogCard key={post.slug} post={post} />
//         ))}
//       </div>
//     </div>
//   );
// }


import Link from "next/link";
import BlogCard from "../../components/blog/BlogCard";
import Button from "../../components/common/Button";
import Avatar from "@/components/common/Avatar";
import { getBlogs } from "@/lib/api/blog";
import { getAllPosts } from "@/lib/helpers/blog";

export default async function LearnPage() {
  
   let posts = [];

  try {
  posts = await getAllPosts();
  } catch (error) {
    console.error("Failed to load blogs for Learn page", error);
  }


  if (!posts || posts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
              Learn
            </p>
            <h1 className="text-3xl font-semibold">Blog & how-tos</h1>
            <p className="text-sm text-zinc-400">
              Stories, lighting breakdowns, and creative business notes.
            </p>
          </div>
          <div className="flex gap-2">
            <Button href="/learn/my-posts" variant="secondary">
              My posts
            </Button>
            <Button href="/learn/new">Create post</Button>
          </div>
        </div>

        <p className="text-sm text-zinc-400">No posts yet.</p>
      </div>
    );
  }

  const [latestPost, ...otherPosts] = posts;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
            Learn
          </p>
          <h1 className="text-3xl font-semibold">Blog & how-tos</h1>
          <p className="text-sm text-zinc-400">
            Stories, lighting breakdowns, and creative business notes.
          </p>
        </div>
        <div className="flex gap-2">
          <Button href="/learn/my-posts" variant="secondary">
            My posts
          </Button>
          <Button href="/learn/new">Create post</Button>
        </div>
      </div>

      {/* Featured / latest post */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 mb-2">Latest post</h2>

        <Link
          href={`/learn/${latestPost.slug}`}
          className="card overflow-hidden p-0 flex flex-col md:flex-row-reverse"
        >
          {/* Image side */}
          <div className="md:w-1/2 w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={latestPost.cover}
              alt={latestPost.title}
              className="w-full h-64 md:h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Text side */}
          <div className="md:w-1/2 w-full p-5 md:p-6 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar src={latestPost.author?.avatar} size={36} />
                <div>
                  <p className="text-sm text-zinc-200">
                    {latestPost.author?.name || "Unknown author"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {latestPost.publishedAt}
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-semibold leading-tight">
                {latestPost.title}
              </h3>

              <p className="text-sm text-zinc-300 line-clamp-3">
                {latestPost.excerpt}
              </p>
            </div>

            {latestPost.tags?.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {latestPost.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Remaining posts below in grid */}
      {otherPosts.length > 0 && (
        <div className="space-y-3">
          {/* <h2 className="text-sm font-medium text-zinc-400">
            More from the blog
          </h2> */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {otherPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
