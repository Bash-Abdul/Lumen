## Frontend Architecture (Next.js App Router, Production-ready)

### Core Principles
- **Separation of concerns**: UI components vs. data hooks vs. API layer (`src/lib/api`). No direct fetches inside components.
- **Composable layout shell**: Sidebar + TopBar in `app/layout.js`, page-level content slots; keep navigation consistent.
- **Server/Client balance**: Use server components for data fetching when possible; limit client components to interactive UI (forms, tabs, toggles).
- **State**: Light local state + context for auth; server data flows through hooks that call the API layer.
- **Routing**: App Router with nested routes; use parallel routes if needed for future modals/overlays.

### Key Pages & Patterns
- **Home** (`/`): Server component for hero + feed preview (SSR), client components for personalized blocks.
- **Feed** (`/feed`): Client page using `useFeed` hook. Masonry layout, infinite scroll or "load more" via cursor API. Cache feed responses with SWR or react-query (optional) keyed by `type+cursor`.
- **Profile** (`/profile`, `/u/[username]`): Server fetch for profile data; client overlays for edit/stats. Masonry grid for posts. Tabs to switch posts/reposts/blogs.
- **Search** (`/search`): Client page with debounced input; calls search API. Tabbed results.
- **Learn** (`/learn`, `/learn/[slug]`, `/learn/new`, `/learn/mine`): Mixed SSR (list/detail) + client forms (new). Draft/publish toggle handled client-side; sends `status`.
- **Hub** (`/hub`, `/hub/[username]`): Creator-only routes; guard via auth context. Client dashboards, server-rendered public hub.
- **Account** (`/account`): Client forms for profile/account settings; patch APIs.
- **Onboarding/Login/Signup**: Client pages; submit to auth endpoints; set cookies/token in httpOnly cookies via API responses.

### API Layer (frontend)
- Located in `src/lib/api/*.js`; each function wraps real HTTP calls when backend is ready.
- Use `fetch` with credentials for auth-protected calls; centralize base URL and error handling.
- For uploads: request signed URL from backend, PUT file to storage, then POST metadata.

### Auth (frontend)
- Use httpOnly cookies for access/refresh; `/auth/me` to hydrate user on server components (via headers/cookies).
- Client context (`useAuth`) mirrors server state; revalidate after login/logout.
- Protect routes with middleware/redirects (e.g., `middleware.js` checking path prefixes like `/hub`, `/account`, `/profile`, `/learn/mine`).

### Caching & Data Fetching (frontend)
- Use Next.js fetch caching for server components (`{ next: { revalidate: N } }`) on public data (blog list, profile).
- Client caching via SWR/react-query for feeds and search to avoid refetch on tab switch.
- Avoid caching for user-specific sensitive data unless keyed per user.

### Rate Limiting / Errors (frontend behavior)
- Gracefully handle 429/5xx with inline toasts/messages; backoff on repeated search/submit.
- Show optimistic UI for likes/reposts; rollback on error.

### Styling & UX
- Tailwind; design tokens in `globals.css`. Masonry grids via CSS columns. Overlays for modals/drawers.
- Keep mobile responsive: single column, stacked nav, bottom CTA where needed.

### Testing & Quality (frontend)
- Lint via ESLint; unit test hooks/utility functions. Playwright/Cypress for critical flows (login, create post, feed pagination).
- A/B friendly: wrap experiments behind feature flags (simple env/remote config).

### Deployment
- Next.js deployed to Vercel or Node server. Use edge middleware for auth gating if desired. Configure image domains and CSP.
