// import Link from "next/link";
// import Button from "@/shared/ui/Button";
// import PostCard from "@/features/feed/components/PostCard";
// import WelcomeBlock from "@/features/home/components/WelcomeBlock";
// import { getCurrentUser } from "@/server/auth/auth-server";
// import { redirect } from "next/navigation";
// import { getFeedPosts } from "@/server/services/feedData";

// export default async function Home() {
//   const user = await getCurrentUser();

//   const {posts} = await getFeedPosts("forYou", 2)

//   // if (!user) {
//   //   redirect('/login');
//   // }

//   // const { user } = useAuth();
//   // const { items } = await getFeed({ type: "forYou", limit: 2 });

//   return (
//     <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-6 items-start">
//       <section className="card p-8 space-y-6 relative overflow-hidden h-fit self-start">
//         <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 via-transparent to-blue-500/10 pointer-events-none" />
//         <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
//           Photography first
//         </p>
//         <h1 className="text-4xl font-bold leading-tight">
//           Build a portfolio-grade hub. Share images. Publish stories. Get hired.
//         </h1>
//         <p className="text-lg text-zinc-300 max-w-3xl">
//           Lumen blends a calm social feed with a focused workspace for creators.
//           Keep your photography, blog posts, and client-facing portfolio in one
//           place.
//         </p>

//         {
//           !user ? (
//             <Button href={'/login'} >Login to access feed</Button>
//           ) : (
//             <div className="flex flex-wrap gap-3">
//               <Button href="/feed">
//                 Enter the feed
//               </Button>
//               <Button href="/learn" variant="outline">
//                 Browse learn
//               </Button>
//             </div>
//           )
//         }

//         {/* <div className="flex flex-wrap gap-3">
//           <Button href="/feed">
//             Enter the feed
//           </Button>
//           <Button href="/learn" variant="outline">
//             Browse learn
//           </Button>
//         </div> */}
//         <div className="grid sm:grid-cols-3 gap-4 pt-4">
//           {[
//             { label: "Creators active", value: "18k" },
//             { label: "Avg. likes", value: "1.2k" },
//             { label: "Hire-ready hubs", value: "4.6k" },
//           ].map((stat) => (
//             <div
//               key={stat.label}
//               className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"
//             >
//               <p className="text-sm text-zinc-400">{stat.label}</p>
//               <p className="text-2xl font-semibold mt-1">{stat.value}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       <div className="space-y-4">
//         <WelcomeBlock checkUser={user} />
//         <div className="card p-6 space-y-4">
//           <div className="flex items-center justify-between">
//             <h3 className="text-lg font-semibold">Latest from the feed</h3>
//             <Link
//               href={!user ? '/login' : '/feed'}
//               className="text-sm text-emerald-300 hover:text-emerald-200"
//             >
//               View all →
//             </Link>
//           </div>
//           <div className="space-y-4">
//             {posts.map((post) => (
//               <PostCard key={post.id} post={post} />
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import Link from "next/link";
import Button from "@/shared/ui/Button";
import PostCard from "@/features/feed/components/PostCard";
import WelcomeBlock from "@/features/home/components/WelcomeBlock";
import { getCurrentUser } from "@/server/auth/auth-server";
import { getFeedPosts } from "@/features/feed/services/feedDataService";

export default async function Home() {
  const user = await getCurrentUser();
  const { posts } = await getFeedPosts("forYou", 4); // Get 4 posts instead of 2

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Section - Full Width */}

       {/* Welcome Block (if not logged in) */}
       
        <div className="px-1">
          <WelcomeBlock checkUser={user} />
        </div>



      <section className="card p-8 lg:p-12 space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 via-transparent to-blue-500/10 pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300 mb-4">
            Photography first
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
            Build a portfolio-grade hub. Share images. Publish stories. Get hired.
          </h1>
          <p className="text-lg text-zinc-300 mb-6">
            Lumen blends a calm social feed with a focused workspace for creators.
            Keep your photography, blog posts, and client-facing portfolio in one place.
          </p>

          {!user ? (
            <div className="flex flex-wrap gap-3">
              <Button href="/signup" size="lg">Get Started Free</Button>
              <Button href="/login" variant="outline" size="lg">Login</Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Button href="/feed" size="lg">Enter the Feed</Button>
              <Button href="/learn" variant="outline" size="lg">Browse Learn</Button>
            </div>
          )}
        </div>

        {/* Stats - Inline with Hero */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 relative z-10">
          {[
            { label: "Active Creators", value: "18k+" },
            { label: "Avg. Engagement", value: "1.2k" },
            { label: "Hire-Ready Portfolios", value: "4.6k" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur p-4"
            >
              <p className="text-xs text-zinc-400 uppercase tracking-wide">{stat.label}</p>
              <p className="text-2xl font-semibold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

     
      {/* Latest Feed Section - Grid Layout */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              {user ? "Latest from Your Feed" : "Discover Amazing Photography"}
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Fresh content from the community
            </p>
          </div>
          <Link
            href={!user ? "/login" : "/feed"}
            className="text-sm text-emerald-300 hover:text-emerald-200 font-medium flex items-center gap-1"
          >
            View all
            <span className="text-lg">→</span>
          </Link>
        </div>

        {/* Posts Grid - 2 columns on desktop */}
        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* Features Section (for non-logged-in users) */}
      {!user && (
        <section className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "📸",
              title: "Share Your Work",
              description: "Upload and showcase your best photography with a beautiful feed experience.",
            },
            {
              icon: "📝",
              title: "Publish Stories",
              description: "Write blog posts about your process, gear, and photography journey.",
            },
            {
              icon: "💼",
              title: "Build Your Portfolio",
              description: "Create a professional hub to attract clients and showcase your expertise.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="card p-6 space-y-3 hover:border-emerald-500/50 transition-colors"
            >
              <div className="text-4xl">{feature.icon}</div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-zinc-400">{feature.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* CTA Section */}
      {!user && (
        <section className="card p-8 lg:p-12 text-center space-y-4 bg-linear-to-br from-emerald-500/5 to-blue-500/5">
          <h2 className="text-3xl font-bold">Ready to start your journey?</h2>
          <p className="text-zinc-300 max-w-2xl mx-auto">
            Join thousands of photographers sharing their work and building their brand on Lumen.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-4">
            <Button href="/signup" size="lg">Create Free Account</Button>
            <Button href="/feed" variant="outline" size="lg">Explore Feed</Button>
          </div>
        </section>
      )}
    </div>
  );
}