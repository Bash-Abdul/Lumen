## Backend Architecture (Node + Postgres + Prisma, Production-ready)

### Approach
- **Modular monolith** only: domain modules (auth, users/profiles, media/posts, feed, blogs, hub, search, billing) inside one deployable service.
- **Scale within the monolith**: add caching, queues, read replicas, and CDN before considering any split.
- **Why**: simpler operations for a smaller user base; keeps latency low and coordination easy while still allowing clear domain boundaries in code.

### Core Components
- **API layer**: Express/Next API routes. Controllers -> services -> repositories (Prisma). Zod for request validation. Central error handler.
- **DB**: PostgreSQL with Prisma. Schema matches domain models. Migrations tracked.
- **Cache/Queues**: Redis for sessions, rate limits, feed/search caching; BullMQ for background jobs (thumbnails, notifications, webhooks).
- **Storage**: S3/R2 for media; signed URLs for upload/download.
- **Search**: Start with SQL ILIKE; later Meilisearch/OpenSearch.
- **Auth**: JWT access + refresh, httpOnly cookies. Roles: visitor/user/creator/admin. Middleware for auth + role checks.
- **Rate limiting**: Redis-based limiter per IP/user; stricter on write endpoints (posts, uploads).

### Domain Responsibilities & Endpoints (REST)
- **Auth**: register/login/refresh/logout; /auth/me. Password reset via token/email job.
- **Users/Profiles**: get/update profile; set links/socials; stats counters (denormed, recalculated in jobs).
- **Media/Posts**: request signed URL; create post with photo URL + caption + tags; get post by id; like/repost toggle.
- **Feed**: /feed?type=forYou|following&cursor; cursor pagination; ranking by recency + engagement.
- **Blogs**: CRUD with `status` (draft/published); publish endpoint; list by author; slug uniqueness.
- **Hub**: CRUD collections, attach photos, public hub by username.
- **Search**: people/images/blogs endpoints; later backed by search index.
- **Billing**: Stripe checkout, webhook to update subscriptions; plan enforcement middleware.
- **Admin**: moderation queue, user search, actions (soft delete, shadowban), audit logs.

### Data Model (summary)
- users, profiles, photos, posts, likes, reposts, follows, blog_posts, hub_collections, collection_photos, subscriptions, audit_logs.
- Draft/publish state on blog_posts; posts.linked photo_id; repost original_post_id; tags as text[].

### Workflows
- **Upload flow**: Client asks `/uploads/sign` → gets signed PUT URL → uploads file → POST /posts with returned URL & metadata. Background job extracts EXIF/generates thumbs.
- **Feed generation**: For-you = recent + engagement weighted query; following = join follows to posts; cache timeline pages in Redis with short TTL.
- **Blog publish**: Draft saved; publish endpoint sets status + published_at; invalidate caches (`/blogs`, `/blogs/:slug`, `/learn/mine`).
- **Hub**: Creator role check; CRUD collections; public view cached.

### Caching Strategy
- **Hot paths**: feed pages, blog lists, profile cards; Redis with versioned keys.
- **Invalidation**: on post create/like/repost, clear user/feed keys; on blog publish/update, clear blog list + slug; on profile update, clear profile + hub cache.
- **HTTP caching**: Cache public GETs with ETags/short max-age; private data no-store.

### Security
- https-only, secure/samesite cookies, CSRF via double-submit token for form posts if needed.
- Input validation (zod), output whitelisting.
- File upload limits + content-type checks; image scanning hook (future).
- RBAC middleware: admin/creator gates; plan enforcement for hub/billing features.
- Rate limits: IP + user buckets; tighter on auth and writes.

### Observability
- Structured logs (pino), request IDs propagated.
- Metrics (Prometheus) for latency, error rates, queue depth.
- Tracing (OpenTelemetry) optional; alerts on 5xx spikes and queue backlogs.

### Deployment
- Containerized (Docker). Compose for local (api + postgres + redis + minio + meilisearch optional).
- CI/CD: lint/test/build, run migrations, seed minimal data for staging.
- Runbook: health checks, rolling deploys, env secrets (DB_URL, REDIS_URL, JWT_SECRET, STRIPE_KEYS, STORAGE_KEYS).

### Evolution Path
- Phase 1: Modular monolith, SQL search, Redis cache, background jobs for media.
- Phase 2: Add search index, CDN in front of S3, more aggressive caching, notifications, read replicas for Postgres.
- Phase 3: Stay monolith; harden observability, add feature flags, optimize queries, and tune queues. Only consider service extraction if growth demands it.
