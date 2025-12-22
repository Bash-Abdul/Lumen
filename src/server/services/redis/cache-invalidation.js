// server/services/cache-invalidation.js
// import { redis, cacheKeys } from "@/lib/redis";
import { redis, cacheKeys } from "./redis";
import { revalidatePath } from "next/cache";

/**
 * Invalidate all feed caches
 * Call this when: post created, post deleted, like/unlike, repost/unrepost
 */
export async function invalidateFeedCache(affectedUserIds = []) {
  try {
    // Invalidate Next.js cached pages
    revalidatePath("/feed");
    revalidatePath("/");

    // Delete all feed cache keys
    // Note: Upstash doesn't support SCAN, so we delete common patterns
    const keysToDelete = [];

    // Anonymous feeds
    keysToDelete.push(cacheKeys.feed("anon", "forYou", null, 20));
    keysToDelete.push(cacheKeys.feed("anon", "forYou", null, 50));

    // Affected user feeds
    for (const userId of affectedUserIds) {
      // Common cursor/limit combinations
      keysToDelete.push(cacheKeys.feed(userId, "forYou", null, 20));
      keysToDelete.push(cacheKeys.feed(userId, "following", null, 20));
      keysToDelete.push(cacheKeys.feed(userId, "forYou", null, 50));
      keysToDelete.push(cacheKeys.feed(userId, "following", null, 50));
    }

    // Delete in batch
    if (keysToDelete.length > 0) {
      await redis.del(...keysToDelete);
      console.log(`[CACHE INVALIDATE] Deleted ${keysToDelete.length} feed keys`);
    }
  } catch (err) {
    console.error("Feed cache invalidation error:", err);
    // Non-blocking - don't fail the request if cache invalidation fails
  }
}

/**
 * Invalidate profile cache
 * Call this when: user profile updated, posts/reposts changed, follow/unfollow
 */
export async function invalidateProfileCache(username) {
  try {
    revalidatePath(`/profile/${username}`);
    revalidatePath(`/${username}`);

    await redis.del(cacheKeys.profile(username));
    console.log(`[CACHE INVALIDATE] Profile: ${username}`);
  } catch (err) {
    console.error("Profile cache invalidation error:", err);
  }
}

/**
 * Invalidate search cache
 * Call this when: user profile updated (username/displayName/bio changed)
 */
export async function invalidateSearchCache() {
  try {
    revalidatePath("/search");

    // Upstash limitation: can't easily delete all search:* keys
    // Solution: Keep TTL very short (15s) so stale data expires quickly
    console.log("[CACHE INVALIDATE] Search cache (TTL-based)");
  } catch (err) {
    console.error("Search cache invalidation error:", err);
  }
}

/**
 * Invalidate multiple caches at once
 * Useful for complex operations affecting multiple areas
 */
export async function invalidateMultiple({ feeds = [], profiles = [], search = false }) {
  await Promise.all([
    feeds.length > 0 ? invalidateFeedCache(feeds) : null,
    ...profiles.map((username) => invalidateProfileCache(username)),
    search ? invalidateSearchCache() : null,
  ]);
}