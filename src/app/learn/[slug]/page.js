import BlogContent from "../../../components/blog/BlogContent";
import { getBlogBySlug } from "../../../lib/api/blog";

export default async function BlogDetailPage({ params }) {
  const post = await getBlogBySlug(params.slug);

  if (!post) {
    return (
      <div className="card p-6">
        <p className="text-sm text-zinc-300">Blog post not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BlogContent post={post} />
    </div>
  );
}
