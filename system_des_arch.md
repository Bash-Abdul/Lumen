## Lumen System Design (Frontend-first, Backend-ready)

Goal: ship a production-ready, photography-first platform with social feed, learn/blog, creator hubs, and portfolio galleries. Keep the architecture simple to start, with clear seams to scale into services.

---

### 1) High-level Architecture
- **Frontend**: Next.js App Router (JS) with Tailwind, client-side contexts for auth/mock state, API abstraction layer under `src/lib/api/*`. Deployed as a static+server bundle (Vercel or Node server).
- **Backend (initial)**: Node (Express or Next API routes), PostgreSQL + Prisma, Redis (sessions/cache), S3-compatible storage for media. Single service (modular monolith) with domain modules.
- **Future split**: service boundaries by domain (auth, media, social/feed, blog, hub/portfolio, billing). Shared contracts via OpenAPI/GraphQL and a small shared types package.

---

### 2) Domains & Responsibilities
- **Auth**: signup/login, session/refresh, roles (visitor/user/creator/admin).
- **Profiles**: display name, username, avatar, bio, links, social handles, counters.
- **Media/Posts**: photo uploads, feed posts, tags, likes, reposts, comments (future).
- **Feed**: for-you vs following timelines, cursor pagination, ranking hooks.
- **Blog/Learn**: markdown or rich-text posts, drafts vs published, tags, author info.
- **Hub/Portfolio**: collections, featured images, public hub page per creator.
- **Search**: people, images, blogs; simple SQL text search initially, optional search index later.
- **Billing**: plan, subscription, payment provider (Stripe), webhooks.
- **Admin/Moderation**: flagging, takedown, user controls (phase later).

---

### 3) Data Model (PostgreSQL, Prisma-friendly)
- **users**: id, email, password_hash, role (enum), created_at, updated_at.
- **profiles**: id (fk users), display_name, username (unique), bio, avatar_url, location, links (jsonb), socials (jsonb), is_creator, plan (enum), stats (jsonb for denormed counters).
- **photos**: id, user_id, url, thumb_url, caption, location, exif (jsonb), tags (text[]), visibility, created_at.
- **posts**: id, user_id, photo_id (nullable), caption, type (photo/blog/repost), original_post_id (for reposts), created_at.
- **likes**: id, user_id, post_id, created_at (unique idx user_id+post_id).
- **reposts**: id, user_id, post_id, created_at (unique idx user_id+post_id).
- **follows**: follower_id, following_id, created_at (unique idx pair).
- **blog_posts**: id, user_id, slug, title, excerpt, cover_url, content, tags (text[]), status (draft/published), published_at, updated_at.
- **hub_collections**: id, user_id, title, description, cover_url, featured_label, created_at.
- **collection_photos**: id, collection_id, photo_id, sort_order.
- **subscriptions**: id, user_id, provider, plan, status, current_period_end, metadata.
- **audit_logs**: id, actor_id, action, target_type, target_id, payload (jsonb), created_at.

---

### 4) API Design (REST, simple and explicit)
- **Auth**: POST /auth/register, POST /auth/login, POST /auth/refresh, POST /auth/logout, GET /auth/me.
- **Users/Profiles**: GET /users/:username, PATCH /users/:username, GET /users/:username/posts, GET /users/:username/blogs.
- **Feed/Posts**: GET /feed?type=forYou|following&cursor=, GET /posts/:id, POST /posts (photo upload metadata), POST /posts/:id/like, POST /posts/:id/repost.
- **Blogs**: GET /blogs, GET /blogs/:slug, POST /blogs (draft/published), PATCH /blogs/:slug, POST /blogs/:slug/publish.
- **Hub**: GET /hub (me), GET /hub/:username (public), POST /hub/collections, PATCH /hub/collections/:id, POST /hub/collections/:id/photos.
- **Search**: GET /search/people|images|blogs?q=.
- **Billing**: GET /billing/plan, POST /billing/checkout, POST /billing/cancel, POST /billing/webhook (provider).
- **Admin** (later): GET /admin/moderation, POST /admin/moderation/:id/action, GET /admin/users.

---

### 5) Backend Implementation Plan (Phase 1)
1) **Project setup**: Node + Express (or Next API routes), Prisma schema from the data model, Postgres connection, env-managed secrets.
2) **Auth/session**: JWT access + refresh tokens, httpOnly cookies; bcrypt for passwords; middleware to hydrate req.user.
3) **Routes/controllers**: domain folders (auth, users, posts, blogs, hub, search, billing). Shared error handler, validation (zod/yup).
4) **Media uploads**: signed URL pattern with S3/R2. API issues signed PUT URL; client uploads directly; API stores metadata.
5) **Feed**: simple SQL joins for forYou/following; cursor pagination; basic ranking by recency + engagement weight.
6) **Blogs**: CRUD with status draft/published; slug generation; basic markdown support.
7) **Hub**: CRUD for collections, attach existing photos; public hub view assembled via queries.
8) **Search**: SQL ILIKE across username/name/caption/tags; paginate.
9) **Billing**: Stripe checkout session, webhook to update subscriptions; guard routes by plan.
10) **Infra**: docker-compose for local (app + Postgres + Redis + minio optional), migrations via Prisma, health checks, logging (pino).

---

### 6) Scaling Plan (Phase 2/3)
- **Caching**: Redis for feed hydration (store precomputed timelines), blog list cache, profile counters.
- **Queues**: BullMQ/Redis for image processing (thumbnails, EXIF), notifications, webhooks.
- **Search index**: Meilisearch or OpenSearch for people/images/blogs; async indexing workers.
- **Media**: move heavy processing off-request; CDN in front of S3; signed GET URLs for private assets.
- **Service boundaries**: extract modules into services if needed (auth, media, content, billing), with API gateway or shared contracts.
- **Observability**: structured logs, metrics (Prometheus), tracing (OpenTelemetry), alerts.
- **Security**: rate limits, content safety scanning, RBAC for admin, strong CORS, secret rotation.

---

### 7) Frontend Integration Notes
- **API abstraction**: keep calls in `src/lib/api/*`; swap mock implementations for real endpoints.
- **Auth guard**: use `GET /auth/me` to hydrate client context; gate creator-only hub and posting routes.
- **Uploads**: use signed PUT URLs for photos; send metadata to POST /posts with returned file URL.
- **Draft vs publish**: blog creation sends `status`; listing uses `/blogs?author=me&status=draft|published`.
- **Pagination**: cursor-based for feeds/search; mirror backend response shape `{items, nextCursor}` already used in hooks.
- **Role/plan**: use plan/is_creator flags to show/hide hub, stats, and premium features.

---

### 8) Rollout Checklist
- Env/secrets: DATABASE_URL, REDIS_URL, STORAGE keys, JWT secrets, STRIPE keys.
- CI: lint/test/build; run migrations; seed minimal data for staging.
- Observability: request logs, error reporting, health endpoint.
- Security: HTTPS, cookie flags (Secure, SameSite), input validation, file type/size limits.
- Performance: image optimization (thumb URLs), CDN for static/media, cache headers on public assets.

---

### 9) Minimal Delivery Order
1) Auth + profiles + feed (photos) + likes/reposts.  
2) Blogs (draft/publish) + search.  
3) Hub/collections + public hub.  
4) Billing + plan gating.  
5) Moderation/admin + observability/caching/search index as scale requires.
