import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { getMyPosts } from "@/lib/helpers/blog";

// const MapPosts = (post) => (
//     {
//         id: post.id,
//         slug: post.slug,
//         title: post.title,
//         tags: post.tags,
//         status: post.status,
//         published: post.publishedAt
//           ? new Intl.DateTimeFormat("en-GB", {
//               year: "numeric",
//               month: "short",
//               day: "2-digit",
//             }).format(post.publishedAt)
//           : null,
//         author: {
//           avatar: post.author?.profile?.avatarUrl ?? null,
//         },
//       }
// )

export async function GET(req) {
    try {
      const currentUser = await getCurrentUser();
  
      if (!currentUser) {
        return NextResponse.json(
          { ok: false, message: "Not authenticated" },
          { status: 401 },
        );
      }
    //   const where = {
    //     userId: currentUser.id,
    //   };
  
    //   const posts = await prisma.blogPost.findMany({
    //     where,
    //     orderBy: [
    //       { status: "asc" }, // drafts first if you like
    //       { updatedAt: "desc" },
    //     ],
    //     include: {
    //         author: {
    //           include: {
    //             profile: {
    //               select: {
    //                 avatarUrl: true,
    //               },
    //             },
    //           },
    //         },
    //       },
    //     // take: limit,
    //   });

    // const posts = await prisma.blogPost.findMany({
    //     where: { userId: currentUser.id },
    //     orderBy: [
    //       { status: "asc" },
    //       { updatedAt: "desc" },
    //     ],
    //     select: {
    //       id: true,
    //       slug: true,
    //       title: true,
    //       tags: true,
    //       status: true,
    //       publishedAt: true,
    //       author: {
    //         select: {
    //           profile: {
    //             select: {
    //               avatarUrl: true,
    //             },
    //           },
    //         },
    //       },
    //     },
    //   });
      
    //   const items = posts.map((post) => ({
    //     id: post.id,
    //     slug: post.slug,
    //     title: post.title,
    //     tags: post.tags,
    //     status: post.status,
    //     published: post.publishedAt
    //       ? new Intl.DateTimeFormat("en-GB", {
    //           year: "numeric",
    //           month: "short",
    //           day: "2-digit",
    //         }).format(post.publishedAt)
    //       : null,
    //     author: {
    //       avatar: post.author?.profile?.avatarUrl ?? null,
    //     },
    //   }));

    const items = await getMyPosts(currentUser.id)
  
      return NextResponse.json({
        ok: true,
        message: "Users post gotten successfully",
        items,
      });
    } catch (err) {
      console.error("Error in GET /api/blog/my-posts", err);
  
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