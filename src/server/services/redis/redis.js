// lib/redis.js
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Cache key builders
export const cacheKeys = {
  feed: (userId, type, cursor, limit) =>
    `feed:${userId || "anon"}:${type}:${cursor || "root"}:${limit}`,

  profile: (username) => `profile:${username}`,

  search: (query) => `search:${query.toLowerCase().trim()}`,

  // Pattern matchers for bulk deletion
  patterns: {
    allFeeds: () => "feed:*",
    userFeeds: (userId) => `feed:${userId}:*`,
    profilePattern: (username) => `profile:${username}`,
  },
};

// Cache TTLs (in seconds)
export const cacheTTL = {
  feed: 90, // 90 seconds
  profile: 120, // 2 minutes
  search: 15, // 15 seconds
};