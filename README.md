# Next Photo Hub

A Next.js photo hub for photographers and creators to share images, publish learn posts, and keep a public profile hub.

## What's inside
- Next.js 16 (App Router) + React 19 with Tailwind 4 styling.
- Auth via NextAuth credentials + Prisma/Postgres; email verification, lockout after repeated failures, resend flow at `/verify-email`.
- Feed and profiles: home feed preview, full feed, and public user pages at `/[username]`.
- Learn/blog posts with drafts/publish and a list at `/learn`.
- Creator hub and uploads with Cloudinary-backed media handling.
- Search across people/photos/blogs plus rate limiting backed by Upstash Redis.
- Email delivery via Resend; middleware guards protected routes.

## Project structure
- `src/app` - routes for auth, feed, hub, learn, search, verify email, profiles.
- `src/features` - feature modules (auth, feed, blog, hub, upload, profile, search).
- `src/server` - auth config, Prisma client, and services (blog, feed, profile, search, email, cloudinary, rate limiter).
- `prisma` - Prisma schema and migrations.

## Getting started
1) Install Node 18+ and PostgreSQL; Cloudinary, Resend, and Upstash accounts are needed for uploads, email, and rate limits.
2) Create `.env` with values like:
DATABASE_URL="postgresql://user:pass@localhost:5432/next-photo-hub"
NEXTAUTH_SECRET="generate-strong-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Lumen Photos"
EMAIL_FROM="hello@example.com"
RESEND_API_KEY="re_xxx"
USE_REAL_EMAILS=false
CLOUDINARY_CLOUD_NAME="your_cloud"
CLOUDINARY_API_KEY="your_key"
CLOUDINARY_API_SECRET="your_secret"
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
3) Install deps: `npm install` (runs `prisma generate`).
4) Apply database: `npx prisma migrate dev` for local; `prisma migrate deploy` in prod.
5) Run dev server: `npm run dev` then open http://localhost:3000.
6) Other scripts: `npm run lint`, `npm run build`, `npm run start`, `npm run vercel-build` (generate Prisma client, run migrations, build).

## Notes
- Unverified users are blocked from login until they verify; resend is offered in the login flow.
- Middleware gating lives in `src/app/middleware.js` for protected areas like hub/account/learn mine.
- Rate limiting uses Upstash Redis (`src/server/services/rate-limiter`).
