// 'use client';

// import FeedTabs from "../../components/feed/FeedTabs";
// import PostCard from "../../components/feed/PostCard";
// import Button from "../../components/common/Button";
// import { useFeed } from "../../lib/hooks/useFeed";
// import useAuth from "@/hooks/useAuth";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

// export default function FeedPage() {
//   const { feedType, setFeedType, posts, loadMore, loading } = useFeed("forYou");

//   const router = useRouter();
//   const { user, isAuthenticated, loading: isLoading } = useAuth();

//   //   useEffect(() => {
//   //   if (!isLoading && !user) {
//   //     router.replace('/login');
//   //   }
//   // }, [user, isLoading, router]);

//   // // if (!user) {
//   // //   router.push('/login')
//   // //   return null;
//   // // }
//   // if (isLoading || !user || !isAuthenticated) {
//   //   return null; // or a spinner
//   // }


//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between flex-wrap gap-4">
//         <div>
//           <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
//             Feed
//           </p>
//           <h1 className="text-3xl font-semibold">Photography stream</h1>
//           <p className="text-sm text-zinc-400">
//             Personalised inspiration and work from people you follow.
//           </p>
//         </div>
//         <FeedTabs isAuthenticated={isAuthenticated} active={feedType} onChange={setFeedType} />
//       </div>

//       <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-4">
//         {posts.map((post) => (
//           <PostCard key={post.id} post={post} />
//         ))}
//       </div>
//       <div className="flex justify-center">
//         <Button onClick={loadMore} variant="secondary" disabled={loading}>
//           {loading ? "Loading..." : "Load more"}
//         </Button>
//       </div>
//     </div>
//   );
// }


import { getCurrentUser } from "@/lib/auth-server";
// import { getFeedPosts } from "@/lib/helpers/feedData";
import { getFeedPosts } from "@/lib/helpers/feedData";
import FeedClient from "./FeedClient";

export default async function FeedPage({ searchParams }) {
  const currentUser = await getCurrentUser();

  const sp = await searchParams;

  const feedType = sp?.type || "forYou";
  const effectiveFeedType =
    feedType === "following" && !currentUser ? "forYou" : feedType;

  const { posts, nextCursor, hasMore } = await getFeedPosts(effectiveFeedType, 20, null);

  return (
    <FeedClient
      initialPosts={posts}
      initialCursor={nextCursor}
      initialHasMore={hasMore}
      feedType={effectiveFeedType}
      isAuthenticated={!!currentUser}
    />
  );
}
