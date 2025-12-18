// middleware.js
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt'; // or your auth method

export async function middleware(request) {
    // 1️⃣ Get the user's authentication token
  const token = await getToken({ req: request });
  // token = user session data if logged in, null if not

  const { pathname } = request.nextUrl;

  // 2️⃣ PROTECTED ROUTES - Must be logged in
  if (pathname.startsWith('/account') || 
      pathname.startsWith('/onboarding') ||
      pathname.startsWith('/profile')) {
    if (!token) {
        // ❌ Not logged in → redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // ✅ Logged in → allow access
  }

  // Auth routes (login/register)
  // 3️⃣ AUTH ROUTES - Must NOT be logged in
  if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    if (token) {
        // ❌ Already logged in → redirect to dashboard
      return NextResponse.redirect(new URL('/', request.url));
    }
    // ✅ Not logged in → allow access to login/register
  }

  // Public routes with auth-required actions
  // e.g., /blog/[slug]/edit
  // 4️⃣ CONDITIONAL ROUTES - Some actions need auth
  if (pathname.match(/\/learn\/.*\/edit$/)) {
     // Matches: /blog/my-post/edit, /blog/another-post/edit
    if (!token) {
        // ❌ Can't edit without login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }


  // 5️⃣ All other routes → continue normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/login',
    '/signup',
    '/blog/:path*/edit',
  ],
};

// // middleware.js
// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";

// export async function middleware(request) {
//   const token = await getToken({ req: request });
//   const { pathname } = request.nextUrl;

//   // ============================================
//   // 1️⃣ AUTH ROUTES - Must be logged OUT
//   // ============================================
//   const authRoutes = ["/login", "/signup"];
//   if (authRoutes.some((route) => pathname.startsWith(route))) {
//     if (token) {
//       // Already logged in → redirect to home
//       return NextResponse.redirect(new URL("/", request.url));
//     }
//   }

//   // ============================================
//   // 2️⃣ PROTECTED ROUTES - Must be logged IN
//   // ============================================
//   const protectedRoutes = ["/account", "/onboarding", "/profile"];
//   if (protectedRoutes.some((route) => pathname.startsWith(route))) {
//     if (!token) {
//       // Not logged in → redirect to login with return URL
//       const loginUrl = new URL("/login", request.url);
//       loginUrl.searchParams.set("next", pathname);
//       return NextResponse.redirect(loginUrl);
//     }
//   }

//   // ============================================
//   // 3️⃣ CONDITIONAL PROTECTED ROUTES
//   // ============================================
//   // /learn/my-posts - requires auth
//   if (pathname === "/learn/my-posts") {
//     if (!token) {
//       const loginUrl = new URL("/login", request.url);
//       loginUrl.searchParams.set("next", pathname);
//       return NextResponse.redirect(loginUrl);
//     }
//   }

//   // /learn/new - creating new posts requires auth
//   if (pathname === "/learn/new") {
//     if (!token) {
//       const loginUrl = new URL("/login", request.url);
//       loginUrl.searchParams.set("next", pathname);
//       return NextResponse.redirect(loginUrl);
//     }
//   }

//   // /learn/[slug]/edit - editing requires auth
//   if (pathname.match(/^\/learn\/[^/]+\/edit$/)) {
//     if (!token) {
//       const loginUrl = new URL("/login", request.url);
//       loginUrl.searchParams.set("next", pathname);
//       return NextResponse.redirect(loginUrl);
//     }
//   }

//   // ============================================
//   // 4️⃣ All other routes are public
//   // ============================================
//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     // Auth routes
//     "/login",
//     "/signup",
    
//     // Protected routes
//     "/account/:path*",
//     "/onboarding/:path*",
//     "/profile/:path*",
    
//     // Conditional protected routes
//     "/learn/my-posts",
//     "/learn/new",
//     "/learn/:slug/edit",
//   ],
// };