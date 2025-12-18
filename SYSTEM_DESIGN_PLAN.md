# System Design Implementation Plan (Portfolio-Ready)

Practical, resume-friendly upgrades for this Next.js + Prisma + NextAuth app. Focus: visible performance/security wins without overbuilding.

## 1) Caching (Redis + CDN)
- **Goal:** Faster feed/profile/blog reads, fewer DB hits.
- **Steps:**
  1) Add Redis client (Upstash/ioredis) under `src/server/services/cache.js`.
  2) Wrap hot reads (feed, profile, blog by slug) with `get`/`set` and TTL; key by resource + params.
  3) Invalidate on writes (post like/repost/upload/blog update/profile edit) by deleting relevant keys.
  4) Keep Cloudinary/CDN for images; ensure `Cache-Control` headers on static assets.
- **Tradeoff:** +Infra + invalidation logic, but big perceived speedup.

## 2) Rate Limiting (Middleware + Redis)
- **Goal:** Protect auth/search/write endpoints; demonstrate abuse controls.
- **Steps:**
  1) Add middleware under `src/server/middleware/rateLimit.js` using Redis counters (IP + route buckets).
  2) Apply to `/api/auth/*`, `/api/search`, `/api/blogs*`, `/api/feed`, `/api/profile`, server actions if exposed.
  3) Return 429 JSON with retry-after; log hits.
- **Tradeoff:** Slight latency per request vs stability/security.

## 3) Database Indexing & Query Hygiene
- **Goal:** Speed critical queries and reduce load.
- **Steps:**
  1) Audit Prisma queries: posts by `createdAt`, `userId`, follows, blog `slug`, search fields.
  2) Add Prisma schema indexes (e.g., `Post(createdAt)`, `Post(userId, createdAt)`, `BlogPost(slug unique)`, `Follow(followerId, followingId)`, `Profile(username unique)`).
  3) Run migration; retest queries.
- **Tradeoff:** Slightly slower writes/migrations, but faster reads; easy CV talking point.

## 4) AuthN/AuthZ Hardening
- **Goal:** Enforce ownership/roles and consistent session checks.
- **Steps:**
  1) Centralize session fetch + ownership checks in `src/server/auth` helpers.
  2) Add authorization guards in `server/services` and server actions (e.g., only owner can edit profile/blog/post).
  3) Use Next.js middleware to gate `(protected)` routes; redirect unauthenticated to login.
  4) Optional: add roles/claims to JWT/session; gate “creator” features by role.
- **Tradeoff:** More guard code/testing, but strong security story.

## 5) Error Handling & Logging
- **Goal:** Production hygiene and debuggability.
- **Steps:**
  1) Add a tiny logger (`pino`/structured console) in `src/server/lib/logger.js`.
  2) Standardize error responses (`{ ok: false, code, message }`) in API routes/server actions.
  3) Wrap service calls with try/catch; log errors with context (user id, route, params).
  4) Optional: integrate Sentry for portfolio screenshots.
- **Tradeoff:** Minimal overhead for much better observability.

## 6) Scalability Practices (Lightweight)
- **Goal:** Show readiness without microservices.
- **Steps:**
  1) Keep app stateless; ensure session/caching use shared stores (NextAuth JWT + Redis).
  2) Enforce pagination on feed/search/blog lists.
  3) Document how you’d add a queue for heavy tasks (image processing, email) even if mocked.
  4) Add config flags (env-driven) for cache TTLs, rate limits, feature toggles.
- **Tradeoff:** Low code cost, good talking points.

## Optional Showcase Add-ons (if time)
- **GraphQL slice:** Add a small `graphql` endpoint exposing feed/profile for demo; keep REST as primary.
- **Background jobs (mock):** Stub a queue interface and a “process upload” job; log instead of real worker.
- **API versioning:** Prefix `/api/v1` and document in README.
- **Design doc snippets:** Brief notes in `docs/` explaining cache keys, invalidation, and rate limits.

## What to Say in Interviews
- You chose a **modular monolith** with clear layers (`app` routes -> `features` UI -> `server/services` + Redis/Prisma) to keep deployment simple while staying scalable.
- **Caching + indexes** target read-heavy paths (feed/profile/blog); you invalidate on writes to preserve correctness.
- **Rate limiting** and **authz guards** protect critical endpoints; you’re using middleware + service-level ownership checks.
- **Logging/error shape**: structured logs, consistent error envelopes, ready for Sentry.
- You stayed **stateless** and would rely on platform load balancing; Redis centralizes shared state if you scale out.

## Is This Enough?
- For a portfolio: **Yes** — caching, rate limits, indexes, authz, and logging give real-world depth without overkill.
- If you have time, add one optional showcase (small GraphQL slice or mock background job) to demonstrate breadth.
