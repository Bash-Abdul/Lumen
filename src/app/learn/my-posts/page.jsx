import Link from "next/link";
import Button from "../../../shared/ui/Button";
import Avatar from "../../../shared/ui/Avatar";
import { getCurrentUser } from "@/server/auth/auth-server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getMyPosts } from "@/server/services/blog";
import PostActions from "../../../features/blog/components/PostActions";

function StatusBadge({ status, published }) {
    const isPublished = !!published;
    const label = isPublished ? "PUBLISHED" : "DRAFT";


    const color = isPublished ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/30" : "bg-amber-500/15 text-amber-200 border-amber-500/30";
  
    return (
      <span className={`text-xs px-2 py-1 rounded-full border ${color}`}>
        {label}
      </span>
    );
  }

  export default async function MyPostsPage() {

    const user = await getCurrentUser();

    if (!user){
        redirect('/login');
    }

    const myPosts = await getMyPosts(user.id);

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
                    <StatusBadge status={post.status} published={post.published} />
                    <Button href={`/learn/${post.slug}`} variant="ghost" size="sm">
                      View
                    </Button>
                    <PostActions slug={post.slug} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
  }
