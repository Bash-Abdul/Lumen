import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import CreateBlogForm from "./CreateBlogForm";

export default async function NewBlogPage() {
  const user = await getCurrentUser();

  if (!user) {
    // send logged-out users away
    redirect(`/login?next=${encodeURIComponent("/learn/new")}`);
  }

  // return <CreateBlogClient />;
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
          Write
        </p>
        <h1 className="text-3xl font-semibold">Create blog post</h1>
        <p className="text-sm text-zinc-400">
          Draft a simple story and choose whether to save as draft or publish.
        </p>
      </div>

      <CreateBlogForm />
    </div>
  );
}
