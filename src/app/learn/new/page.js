// import { redirect } from "next/navigation";
// import { getCurrentUser } from "@/server/auth/auth-server";
// import CreateBlogForm from "./CreateBlogForm";

// export default async function NewBlogPage() {
//   const user = await getCurrentUser();

//   if (!user) {
//     // send logged-out users away
//     redirect(`/login?next=${encodeURIComponent("/learn/new")}`);
//   }

//   // return <CreateBlogClient />;
//   return (
//     <div className="space-y-6">
//       <div>
//         <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
//           Write
//         </p>
//         <h1 className="text-3xl font-semibold">Create blog post</h1>
//         <p className="text-sm text-zinc-400">
//           Draft a simple story and choose whether to save as draft or publish.
//         </p>
//       </div>

//       <CreateBlogForm />
//     </div>
//   );
// }


import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/auth-server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Button from "@/shared/ui/Button";
import CreateBlogForm from "./CreateBlogForm";

export default async function NewBlogPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/learn/new")}`);
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/learn"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Learn
      </Link>

      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300 mb-2">
          Write
        </p>
        <h1 className="text-4xl font-bold">Create Your Story</h1>
        <p className="text-zinc-400 mt-2">
          Share your process, techniques, or creative journey with the community.
        </p>
      </div>

      <CreateBlogForm />
    </div>
  );
}