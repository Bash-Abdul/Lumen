import { getCurrentUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { getBlogBySlug } from "@/lib/helpers/blog";
import EditBlogForm from "./EditBlogForm";

export default async function EditPostPage({ params }){
    const resolvedParams = await params
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
      }

      const post = await getBlogBySlug(resolvedParams.slug);

      if (!post) {
        redirect("/learn/my-posts");
      }

      // Only author can edit
      if (post.author.id !== user.id) {
        redirect("/learn/my-posts");
      }


      return (
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
              Edit
            </p>
            <h1 className="text-3xl font-semibold">Edit blog post</h1>
            <p className="text-sm text-zinc-400">
              Update your post or change its publish status.
            </p>
          </div>
    
          <EditBlogForm post={post} />
        </div>
      );
}