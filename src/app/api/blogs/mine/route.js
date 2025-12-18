// // src/app/api/blog/mine/route.js
// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prisma";
// import { getCurrentUser } from "@/server/auth/auth-server";
// import { BlogStatusSchema } from "@/features/blog/validation/blog";

// // GET /api/blog/mine - posts belonging to logged-in user
// export async function GET(req) {
//   const currentUser = await getCurrentUser();

//   if (!currentUser) {
//     return NextResponse.json(
//       { ok: false, message: "Not authenticated" },
//       { status: 401 },
//     );
//   }

//   const { searchParams } = new URL(req.url);
//   const statusParam = searchParams.get("status");
//   const limitRaw = searchParams.get("limit") || "50";
//   let limit = Number(limitRaw);
//   if (Number.isNaN(limit) || limit < 1 || limit > 100) {
//     limit = 50;
//   }

//   const where = {
//     userId: currentUser.id,
//   };

//   if (statusParam) {
//     const parsedStatus = BlogStatusSchema.safeParse(statusParam);
//     if (parsedStatus.success) {
//       where.status = parsedStatus.data;
//     }
//   }

//   const posts = await prisma.blogPost.findMany({
//     where,
//     orderBy: [
//       { status: "asc" },       // drafts first if you like
//       { updatedAt: "desc" },
//     ],
//     take: limit,
//   });

//   return NextResponse.json({ ok: true, items: posts });
// }


// ===================================

// // src/app/api/blog/mine/route.js
// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prisma";
// import { getCurrentUser } from "@/server/auth/auth-server";
// import { BlogStatusSchema } from "@/features/blog/validation/blog";

// // GET /api/blog/mine - posts belonging to logged in user
// export async function GET(req) {
//   try {
//     const currentUser = await getCurrentUser();

//     if (!currentUser) {
//       return NextResponse.json(
//         { ok: false, message: "Not authenticated" },
//         { status: 401 },
//       );
//     }

//     const { searchParams } = new URL(req.url);
//     const statusParam = searchParams.get("status");
//     const limitRaw = searchParams.get("limit") || "50";

//     let limit = Number(limitRaw);
//     if (Number.isNaN(limit) || limit < 1 || limit > 100) {
//       limit = 50;
//     }

//     const where = {
//       userId: currentUser.id,
//     };

//     if (statusParam) {
//       const parsedStatus = BlogStatusSchema.safeParse(statusParam);
//       if (parsedStatus.success) {
//         where.status = parsedStatus.data;
//       }
//     }

//     const posts = await prisma.blogPost.findMany({
//       where,
//       orderBy: [
//         { status: "asc" },      // drafts first if you like
//         { updatedAt: "desc" },
//       ],
//       take: limit,
//     });

//     return NextResponse.json({ ok: true, message: 'Users post gotten successfully', items: posts });
//   } catch (err) {
//     console.error("Error in GET /api/blog/mine", err);

//     return NextResponse.json(
//       {
//         ok: false,
//         message: "Server error while loading your posts",
//         error: err instanceof Error ? err.message : String(err),
//       },
//       { status: 500 },
//     );
//   }
// }


// // ========================================================
import { NextResponse } from "next/server";
import prisma from "@/server/db/prisma";
import { getCurrentUser } from "@/server/auth/auth-server";
// import { BlogStatusSchema } from "@/features/blog/validation/blog";

// GET /api/blog/mine - posts belonging to logged in user
export async function GET(req) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { ok: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    // 🔻 Commented out for now, no query params / filters
    // const { searchParams } = new URL(req.url);
    // const statusParam = searchParams.get("status");
    // const limitRaw = searchParams.get("limit") || "50";

    // let limit = Number(limitRaw);
    // if (Number.isNaN(limit) || limit < 1 || limit > 100) {
    //   limit = 50;
    // }

    const where = {
      userId: currentUser.id,
    };

    // if (statusParam) {
    //   const parsedStatus = BlogStatusSchema.safeParse(statusParam);
    //   if (parsedStatus.success) {
    //     where.status = parsedStatus.data;
    //   }
    // }

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: [
        { status: "asc" }, // drafts first if you like
        { updatedAt: "desc" },
      ],
      // take: limit,
    });

    return NextResponse.json({
      ok: true,
      message: "Users post gotten successfully",
      items: posts,
    });
  } catch (err) {
    console.error("Error in GET /api/blog/mine", err);

    return NextResponse.json(
      {
        ok: false,
        message: "Server error while loading your posts",
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
