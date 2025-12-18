"use client";

import { useEffect, useMemo, useState, useTransition, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import FeedTabs from "@/components/feed/FeedTabs";
import PostCard from "@/components/feed/PostCard";
import Button from "@/components/common/Button";
import { toast } from "sonner";

export default function FeedClient({
  initialPosts,
  initialCursor,
  initialHasMore,
  feedType,
  isAuthenticated,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [posts, setPosts] = useState(initialPosts || []);
  const [cursor, setCursor] = useState(initialCursor || null);
  const [hasMore, setHasMore] = useState(!!initialHasMore);

    // This is your rule: first load is manual, then auto
    const [autoLoadEnabled, setAutoLoadEnabled] = useState(false);

    // Sentinel element at the bottom
    const loadMoreRef = useRef(null);
  
    // Prevent multiple fetches at once
    const fetchingRef = useRef(false);

      // Reset state when server props change (tab change or navigation)
  useEffect(() => {
    setPosts(initialPosts || []);
    setCursor(initialCursor || null);
    setHasMore(!!initialHasMore);
    setAutoLoadEnabled(false);
    fetchingRef.current = false;
  }, [initialPosts, initialCursor, initialHasMore, feedType]);

  const emptyText = useMemo(() => {
    if (feedType === "following") return "No posts from people you follow yet.";
    return "No posts yet.";
  }, [feedType]);

  const onChangeTab = (nextType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", nextType);

    startTransition(() => {
      router.push(`/feed?${params.toString()}`);
    });
  };

  const fetchMore = async () => {
    if (!hasMore) return;
    if (!cursor) return;
    if (fetchingRef.current) return;

    fetchingRef.current = true;

    try {
      const res = await fetch(
        `/api/feed?type=${encodeURIComponent(feedType)}&limit=20&cursor=${encodeURIComponent(
          cursor
        )}`,
        { cache: "no-store" }
      );

      if (!res.ok) {
        toast.error("Failed to load more posts");
        fetchingRef.current = false;
        return;
      }

      const data = await res.json();

      setPosts((prev) => [...prev, ...(data.posts || [])]);
      setCursor(data.nextCursor || null);
      setHasMore(!!data.hasMore);
    } catch (e) {
      toast.error("Network error loading more posts");
    } finally {
      fetchingRef.current = false;
    }
  };

  // Manual first click
  const handleLoadMoreClick = () => {
    startTransition(async () => {
      await fetchMore();
      setAutoLoadEnabled(true);
    });
  };

  // Infinite scroll only after the first click
  useEffect(() => {
    if (!autoLoadEnabled) return;
    if (!hasMore) return;

    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;

        startTransition(async () => {
          await fetchMore();
        });
      },
      {
        root: null,
        rootMargin: "800px",
        threshold: 0,
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [autoLoadEnabled, hasMore, feedType, cursor]);

//   // When server re-renders this component with new props (tab change), reset state
//   useEffect(() => {
//     setPosts(initialPosts || []);
//     setCursor(initialCursor || null);
//     setHasMore(!!initialHasMore);

//     setAutoLoadEnabled(false);
//     fetchingRef.current = false;

//   }, [initialPosts, initialCursor, initialHasMore, feedType]);

//   const emptyText = useMemo(() => {
//     if (feedType === "following") return "No posts from people you follow yet.";
//     return "No posts yet.";
//   }, [feedType]);

//   const onChangeTab = (nextType) => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.set("type", nextType);

//     startTransition(() => {
//       router.push(`/feed?${params.toString()}`);
//     });
//   };

//   const loadMore = () => {
//     if (!hasMore || !cursor) return;

//     startTransition(async () => {
//       try {
//         const res = await fetch(
//           `/api/feed?type=${encodeURIComponent(feedType)}&limit=20&cursor=${encodeURIComponent(
//             cursor
//           )}`,
//           { cache: "no-store" }
//         );

//         if (!res.ok) {
//           toast.error("Failed to load more posts");
//           return;
//         }

//         const data = await res.json();

//         setPosts((prev) => [...prev, ...(data.posts || [])]);
//         setCursor(data.nextCursor || null);
//         setHasMore(!!data.hasMore);
//       } catch (e) {
//         toast.error("Network error loading more posts");
//       }
//     });
//   };

//   const emptyText =
//     feedType === "following"
//       ? "No posts from people you follow yet."
//       : "No posts yet.";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Feed</p>
          <h1 className="text-3xl font-semibold">Photography stream</h1>
          <p className="text-sm text-zinc-400">
            Personalised inspiration and work from people you follow.
          </p>
        </div>

        <FeedTabs
          isAuthenticated={isAuthenticated}
          active={feedType}
          onChange={onChangeTab}
        />
      </div>

      {posts.length === 0 ? (
        <div className="border border-dashed border-zinc-800 rounded-xl p-6 bg-zinc-950/50">
          <p className="text-sm text-zinc-400">{emptyText}</p>
          {!isAuthenticated && (
            <p className="text-xs text-zinc-500 mt-2">
              Log in to unlock the Following feed and interact with posts.
            </p>
          )}
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

         {/* Sentinel for auto-loading */}
         <div ref={loadMoreRef} className="h-1" />

<div className="flex justify-center">
  {hasMore ? (
    !autoLoadEnabled ? (
      <Button
        onClick={handleLoadMoreClick}
        variant="secondary"
        disabled={isPending}
      >
        {isPending ? "Loading..." : "Load more"}
      </Button>
    ) : (
      <p className="text-xs text-zinc-500">
        {isPending ? "Loading more..." : "Scroll to load more"}
      </p>
    )
  ) : posts.length > 0 ? (
    <p className="text-xs text-zinc-500">You are all caught up.</p>
  ) : null}
</div>

      {/* <div className="flex justify-center">
        {hasMore ? (
          <Button onClick={loadMore} variant="secondary" disabled={isPending}>
            {isPending ? "Loading..." : "Load more"}
          </Button>
        ) : (
          posts.length > 0 && (
            <p className="text-xs text-zinc-500">You are all caught up.</p>
          )
        )}
      </div> */}
    </div>
  );
}
