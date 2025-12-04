'use client';

import FeedTabs from "../../components/feed/FeedTabs";
import PostCard from "../../components/feed/PostCard";
import Button from "../../components/common/Button";
import { useFeed } from "../../lib/hooks/useFeed";

export default function FeedPage() {
  const { feedType, setFeedType, posts, loadMore, loading } = useFeed("forYou");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
            Feed
          </p>
          <h1 className="text-3xl font-semibold">Photography stream</h1>
          <p className="text-sm text-zinc-400">
            Personalised inspiration and work from people you follow.
          </p>
        </div>
        <FeedTabs active={feedType} onChange={setFeedType} />
      </div>

      <div className="grid grid-cols-3 gap-5">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <div className="flex justify-center">
        <Button onClick={loadMore} variant="secondary" disabled={loading}>
          {loading ? "Loading..." : "Load more"}
        </Button>
      </div>
    </div>
  );
}
