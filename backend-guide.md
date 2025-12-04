# Backend Guide — Lumen Photography Platform

## Overview
- **Responsibilities**: auth & sessions, user profiles, photo upload/storage, feed and social graph (follows/likes/reposts), blogs, hub/portfolio collections, search, billing/plans, admin/moderation.
- **Frontend today**: mock API functions in `src/lib/api/*.js`. Replace their internals with real HTTP calls when backend exists.
- **Target stack**: Node (Express / Next API routes), PostgreSQL (SQL + Prisma/TypeORM), Redis for caching/queues, object storage (S3 compatible) for media, background workers for heavy tasks.

## Data Model (PostgreSQL, relational)
- **users**: id (uuid), email (unique), password_hash, role (visitor/user/creator/admin), created_at, updated_at.
- **profiles**: id (pk/fk users.id), display_name, username (unique), bio, location, avatar_url, website, socials (jsonb), is_creator (bool), plan (enum free/pro/pro+), stats (jsonb for denormed counters).
- **photos**: id, user_id (fk), url, thumb_url, caption, location, exif (jsonb), tags (array), visibility (public/unlisted/private), created_at.
- **posts**: id, user_id (fk), photo_id (fk nullable if blog-only), caption, type (photo/blog/repost), original_post_id (fk for repost), created_at.
- **likes**: id, user_id, post_id, created_at (unique idx on user_id+post_id).
- **reposts**: id, user_id, post_id, created_at (unique idx on user_id+post_id).
- **follows**: follower_id, following_id, created_at (unique idx on pair).
- **blog_posts**: id, user_id, slug (unique), title, excerpt, cover_url, content, tags (array), published_at, status (draft/published).
- **hub_collections**: id, user_id, title, description, cover_url, featured_label, created_at.
- **collection_photos**: id, collection_id, photo_id, sort_order.
- **subscriptions**: id, user_id, provider (stripe), status, plan, current_period_end, metadata (jsonb).
- **audit_logs**: id, actor_id, action, target_type, target_id, payload (jsonb), created_at.

## REST API (representative)
Auth
- `POST /api/auth/register` — {email,password,username} → {user,token} (public).
- `POST /api/auth/login` — {email,password} → {user,token} (public).
- `POST /api/auth/refresh` — {refreshToken} → {token} (public with valid refresh).
- `POST /api/auth/logout` — header auth, revokes refresh (auth required).

Users & Profiles
- `GET /api/users/:username` — profile + counters (public).
- `PATCH /api/users/:username` — {display_name,bio,location,links,avatar_url,is_creator} (auth owner).
- `GET /api/users/:username/posts` — list posts/photos (public).
- `GET /api/users/:username/blogs` — list blog posts (public).

Feed & Posts
- `GET /api/feed` — query: type=forYou|following, cursor, limit → {items,nextCursor} (auth optional for forYou, auth required for following).
- `POST /api/posts` — {photo_id|photo_upload,caption,tags} (auth).
- `GET /api/posts/:id` — post detail (public).
- `POST /api/posts/:id/repost` — {comment?} (auth).

Likes & Reposts
- `POST /api/posts/:id/like` — toggles like, returns counts (auth).
- `POST /api/posts/:id/repost` — toggles repost, returns counts (auth).

Blogs
- `GET /api/blogs` — list with pagination/filter by tag (public).
- `GET /api/blogs/:slug` — detail (public).
- `POST /api/blogs` — {title,excerpt,cover_url,content,tags,status} (auth).
- `PATCH /api/blogs/:slug` — update (auth owner or admin).

Hub & Collections
- `GET /api/hub` — current user hub (auth creator).
- `GET /api/hub/:username` — public hub view (public).
- `POST /api/hub/collections` — {title,description,cover_url,featured_label} (auth creator).
- `PATCH /api/hub/collections/:id` — update (auth owner).
- `POST /api/hub/collections/:id/photos` — {photo_id[]} (auth owner).

Search
- `GET /api/search/people?q=` — search users (public).
- `GET /api/search/images?q=` — search posts/photos (public).
- `GET /api/search/blogs?q=` — search blogs (public).

Account & Billing
- `GET /api/account` — profile + subscription summary (auth).
- `POST /api/account/subscription` — {plan, payment_method_id} (auth).
- `POST /api/account/cancel` — cancel subscription (auth).

Admin & Moderation
- `GET /api/admin/moderation/queue` — flagged content (admin).
- `POST /api/admin/moderation/:id/action` — {action,reason} (admin).
- `GET /api/admin/users` — list/search users (admin).

## Basic Implementation (Phase 1 shape)
1. **Server**: Node + Express (or Next API routes). Layers: routes → controllers → services → repositories (ORM). Shared error handler and response envelope.
2. **ORM**: Prisma connected to PostgreSQL. Generate types/models; migrations stored in repo.
3. **Auth**: JWT access + refresh cookies; bcrypt for passwords; middleware populates `req.user`.
4. **Uploads**: Accept multipart for photos; for prototype store in disk or S3-compatible bucket; return URLs saved in `photos`.
5. **Feed**: service queries `posts` joined with `photos` and `profiles`; `following` filter uses join on follows; cursor-based pagination.
6. **Blogs**: simple CRUD, markdown or rich-text stored in `content` (text).
7. **Search**: initial SQL ILIKE across username/name/caption/tags; paginate.
8. **Billing**: Stripe checkout sessions & webhooks populating `subscriptions`.
9. **Admin**: feature flag route guard by role=admin; basic audit logging on admin actions.

## Evolving to Advanced Architecture
- **Modular monolith**: separate modules (auth, media, social, blog, hub, billing) with clear service boundaries and DTOs.
- **File storage**: move uploads to S3/Cloudflare R2. Media service signs PUT URLs; API only stores metadata.
- **Background jobs**: queue (BullMQ/RabbitMQ) for image processing (thumbnails, EXIF), email, webhook handling, analytics aggregation.
- **Caching**: Redis for feed hydration (store precomputed timelines), blog list cache, profile counters; CDN for media.
- **Search**: push to OpenSearch/Meilisearch for people/images/blogs; async indexing workers.
- **Observability**: structured logs (pino), metrics (Prometheus), tracing (OpenTelemetry), uptime alerts.
- **Security**: rate limits per route, content safety scanning, signed URLs for private assets, strict CORS.
- **Testing**: unit tests (services), integration tests (supertest against API), contract tests for client/server DTOs.

## Roadmap
- **Phase 1 (MVP)**: Auth, profiles, photo upload, feed (forYou/following), likes/reposts, blogs CRUD, basic search (SQL), account settings. REST, single service.
- **Phase 2 (Creator)**: Hub/collections CRUD, public hub pages, subscription plans (Stripe), role/plan enforcement, improved feed ranking signals, media storage to S3.
- **Phase 3 (Scale)**: Redis caching for feed/search, background jobs for media & notifications, search indexer, CDN, analytics events, admin moderation workflows, canary deployments + observability.

## Frontend Mapping (swap mock functions for real HTTP)
- `src/lib/api/auth.js` → `/api/auth/me`, `/api/auth/login`, `/api/auth/logout`.
- `src/lib/api/feed.js` → `/api/feed`, `/api/posts/:id`.
- `src/lib/api/profile.js` → `/api/users/:username`, `/api/users/:username/posts`, `/api/users/:username/blogs`, `PATCH /api/users/:username`.
- `src/lib/api/search.js` → `/api/search/people|images|blogs`.
- `src/lib/api/blog.js` → `/api/blogs`, `/api/blogs/:slug`.
- `src/lib/api/hub.js` → `/api/hub`, `/api/hub/:username`, `/api/hub/collections`.
- Hooks like `useFeed`, `useSearch`, `useBlogs` remain unchanged; only switch implementations inside the corresponding API modules when backend endpoints exist.

## Notes
- Keep pagination cursor-based across feeds/search.
- Use signed URL uploads to avoid routing large files through the API server.
- Denormalize counters cautiously; recompute via background jobs to stay consistent.
- Protect creator-only routes with middleware plus feature flags. Admin tools should log every action to `audit_logs`.
