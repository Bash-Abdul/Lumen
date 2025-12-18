import BlogContent from "../../../features/blog/components/BlogContent";
import PostActions from "../../../features/blog/components/PostActions";
import { getBlogBySlug } from "@/server/services/blog";
import { getCurrentUser } from "@/server/auth/auth-server";

export default async function BlogDetailPage({ params }) {
  const resolvedParams = await params;
  const post = await getBlogBySlug(resolvedParams?.slug);
  const user = await getCurrentUser();
  const isOwner = user && post?.author?.id ? post.author.id === user.id : post?.author?.name === user?.name;

  if (!post) {
    return (
      <div className="card p-6">
        <p className="text-sm text-zinc-300">Blog post not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        {isOwner && <PostActions slug={post.slug} />}
      </div>
      <BlogContent post={post} />
    </div>
  );
}
