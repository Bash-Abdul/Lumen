// import { getCurrentUser } from "@/server/auth/auth-server";
// import { redirect } from "next/navigation";
// import { getBlogBySlug } from "@/server/services/blog";
// import EditBlogForm from "./EditBlogForm";

// export default async function EditPostPage({ params }){
//     const resolvedParams = await params
//     const user = await getCurrentUser();

//     if (!user) {
//         redirect("/login");
//       }

//       const post = await getBlogBySlug(resolvedParams.slug);

//       if (!post) {
//         redirect("/learn/my-posts");
//       }

//       // Only author can edit
//       if (post.author.id !== user.id) {
//         redirect("/learn/my-posts");
//       }


//       return (
//         <div className="space-y-6">
//           <div>
//             <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
//               Edit
//             </p>
//             <h1 className="text-3xl font-semibold">Edit blog post</h1>
//             <p className="text-sm text-zinc-400">
//               Update your post or change its publish status.
//             </p>
//           </div>
    
//           <EditBlogForm post={post} />
//         </div>
//       );
// }


import { getCurrentUser } from "@/server/auth/auth-server";
import { redirect } from "next/navigation";
// import { getBlogBySlug } from "@/server/services/blog";
import { getBlogBySlug } from "@/features/blog/services/blogService";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import EditBlogForm from "./EditBlogForm";

export default async function EditPostPage({ params }) {
  const resolvedParams = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const post = await getBlogBySlug(resolvedParams.slug);

  if (!post) {
    redirect("/learn/my-posts");
  }

  if (post.author.id !== user.id) {
    redirect("/learn/my-posts");
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/learn/${post.slug}`}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Post
      </Link>

      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300 mb-2">
          Edit
        </p>
        <h1 className="text-4xl font-bold">Edit Your Story</h1>
        <p className="text-zinc-400 mt-2">
          Update your post or change its publish status.
        </p>
      </div>

      <EditBlogForm post={post} />
    </div>
  );
}
