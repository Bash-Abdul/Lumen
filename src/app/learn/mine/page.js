import Link from "next/link";
import Button from "../../../components/common/Button";
import Avatar from "../../../components/common/Avatar";
import { getCurrentUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";

function StatusBadge({ status = "DRAFT" }) {
  const normalized = String(status).toUpperCase(); 
  const color =
    normalized === "PUBLISHED"
      ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/30"
      : "bg-amber-500/15 text-amber-200 border-amber-500/30";

  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${color}`}>
      {normalized}
    </span>
  );
}

export default async function MyPostsPage() {
  // const user = await getCurrentUser();

  // if (!user) {
  //   redirect("/login?next=/learn/mine");
  // }

  // // Relative fetch keeps cookies/session attached automatically in app router
  // const res = await fetch(`/api/blogs/mine`, { cache: "no-store" });

  // if (!res.ok) {
  //   console.error("Failed to load blogs", res.status);
  //   return (
  //     <div className="space-y-4">
  //       <p className="text-red-400 text-sm">
  //         Failed to load your posts, status {res.status}
  //       </p>
  //     </div>
  //   );
  // }

  // const data = await res.json();
  // const myPosts = data.items || [];
  const myPosts = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
            Learn
          </p>
          <h1 className="text-3xl font-semibold">My posts</h1>
          <p className="text-sm text-zinc-400">
            Drafts and published articles you&apos;ve created.
          </p>
        </div>
        <Button href="/learn/new">New post</Button>
      </div>

      {myPosts.length === 0 ? (
        <div className="card p-6 flex items-center justify-between">
          <p className="text-sm text-zinc-300">
            You haven&apos;t written any posts yet.
          </p>
          <Button href="/learn/new" variant="secondary" size="sm">
            Start writing
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {myPosts.map((post) => (
            <div
              key={post.slug}
              className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex items-center gap-3 flex-1">
                <Avatar src={post.author?.avatar} size={44} />
                <div>
                  <Link
                    href={`/learn/${post.slug}`}
                    className="text-base font-semibold"
                  >
                    {post.title}
                  </Link>
                  <p className="text-xs text-zinc-400">
                    {post.published} - {post.tags?.join(", ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={post.status} />
                <Button
                  href={`/learn/${post.slug}`}
                  variant="ghost"
                  size="sm"
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// import React from 'react'

// const Page = () => {
//   return (
//     <div>page</div>
//   )
// }

// export default Page