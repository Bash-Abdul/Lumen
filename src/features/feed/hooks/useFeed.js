'use client';

import { useEffect, useState } from "react";
import { getFeed } from "../api/feed";

export function useFeed(initialType = "forYou") {
  const [feedType, setFeedType] = useState(initialType);
  const [posts, setPosts] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getFeed({ type: feedType, cursor: 0 })
      .then(({ items, nextCursor }) => {
        setPosts(items);
        setCursor(nextCursor);
      })
      .finally(() => setLoading(false));
  }, [feedType]);

  const loadMore = async () => {
    if (cursor === 0 && posts.length) return;
    setLoading(true);
    const { items, nextCursor } = await getFeed({
      type: feedType,
      cursor,
    });
    setPosts((prev) => [...prev, ...items]);
    setCursor(nextCursor);
    setLoading(false);
  };

  return { feedType, setFeedType, posts, loadMore, loading };
}
