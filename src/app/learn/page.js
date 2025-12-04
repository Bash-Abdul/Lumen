import Link from "next/link";
import BlogCard from "../../components/blog/BlogCard";
import Button from "../../components/common/Button";
import { getBlogs } from "../../lib/api/blog";

export default async function LearnPage() {
  const posts = await getBlogs();

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
        <Button href="/learn/new">
          Create post
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
