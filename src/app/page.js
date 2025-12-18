import Link from "next/link";
import Button from "@/shared/ui/Button";
import PostCard from "@/features/feed/components/PostCard";
import WelcomeBlock from "@/features/home/components/WelcomeBlock";
import { getCurrentUser } from "@/server/auth/auth-server";
import { redirect } from "next/navigation";
import { getFeedPosts } from "@/server/services/feedData";

export default async function Home() {
  const user = await getCurrentUser();

  const {posts} = await getFeedPosts("forYou", 2)

  // if (!user) {
  //   redirect('/login');
  // }

  // const { user } = useAuth();
  // const { items } = await getFeed({ type: "forYou", limit: 2 });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-6 items-start">
      <section className="card p-8 space-y-6 relative overflow-hidden h-fit self-start">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 via-transparent to-blue-500/10 pointer-events-none" />
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
          Photography first
        </p>
        <h1 className="text-4xl font-bold leading-tight">
          Build a portfolio-grade hub. Share images. Publish stories. Get hired.
        </h1>
        <p className="text-lg text-zinc-300 max-w-3xl">
          Lumen blends a calm social feed with a focused workspace for creators.
          Keep your photography, blog posts, and client-facing portfolio in one
          place.
        </p>

        {
          !user ? (
            <Button href={'/login'} >Login to access feed</Button>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Button href="/feed">
                Enter the feed
              </Button>
              <Button href="/learn" variant="outline">
                Browse learn
              </Button>
            </div>
          )
        }

        {/* <div className="flex flex-wrap gap-3">
          <Button href="/feed">
            Enter the feed
          </Button>
          <Button href="/learn" variant="outline">
            Browse learn
          </Button>
        </div> */}
        <div className="grid sm:grid-cols-3 gap-4 pt-4">
          {[
            { label: "Creators active", value: "18k" },
            { label: "Avg. likes", value: "1.2k" },
            { label: "Hire-ready hubs", value: "4.6k" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"
            >
              <p className="text-sm text-zinc-400">{stat.label}</p>
              <p className="text-2xl font-semibold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-4">
        <WelcomeBlock checkUser={user} />
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Latest from the feed</h3>
            <Link
              href={!user ? '/login' : '/feed'}
              className="text-sm text-emerald-300 hover:text-emerald-200"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
