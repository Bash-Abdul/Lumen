// import BlogContent from "../../../features/blog/components/BlogContent";
// import PostActions from "../../../features/blog/components/PostActions";
// import { getBlogBySlug } from "@/server/services/blog";
// import { getCurrentUser } from "@/server/auth/auth-server";

// export default async function BlogDetailPage({ params }) {
//   const resolvedParams = await params;
//   const post = await getBlogBySlug(resolvedParams?.slug);
//   const user = await getCurrentUser();
//   const isOwner = user && post?.author?.id ? post.author.id === user.id : post?.author?.name === user?.name;

//   if (!post) {
//     return (
//       <div className="card p-6">
//         <p className="text-sm text-zinc-300">Blog post not found.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <div />
//         {isOwner && <PostActions slug={post.slug} />}
//       </div>
//       <BlogContent post={post} />
//     </div>
//   );
// }


import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import BlogContent from "../../../features/blog/components/BlogContent";
import PostActions from "../../../features/blog/components/PostActions";
// import { getBlogBySlug } from "@/server/services/blog";
import { getBlogBySlug } from "@/features/blog/services/blogService";
import { getCurrentUser } from "@/server/auth/auth-server";

export default async function BlogDetailPage({ params }) {
  const resolvedParams = await params;
  const post = await getBlogBySlug(resolvedParams?.slug);
  const user = await getCurrentUser();
  const isOwner = user && post?.author?.id ? post.author.id === user.id : post?.author?.name === user?.name;

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Learn
        </Link>
        <div className="card p-12 text-center space-y-4">
          <p className="text-zinc-300">Blog post not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button and actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Learn
        </Link>
        {isOwner && <PostActions slug={post.slug} />}
      </div>

      <BlogContent post={post} />
    </div>
  );
}
