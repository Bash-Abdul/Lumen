// lib/blogs.js
import prisma from "@/server/db/prisma";
import { getCurrentUser } from "@/server/auth/auth-server";
// import { NextResponse } from "next/server";



export async function getAllPosts(limit = 20) {

    // const { searchParams } = new URL(req.url);
    // const limitRaw = searchParams.get("limit") || "20";
    // let limit = Number(limitRaw);
    // if (Number.isNaN(limit) || limit < 1 || limit > 100) {
    //   limit = 20;
    // }

    const safeLimit =
    typeof limit === "number" && limit >= 1 && limit <= 100 ? limit : 20;

    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: safeLimit,
      include: {
        author: {
          include: {
            profile: {
              select: {
                displayName: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    const blogItems = posts.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      cover: post.coverUrl,
      tags: post.tags,
      publishedAt: post.publishedAt
      ? new Intl.DateTimeFormat("en-GB", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        }).format(post.publishedAt)
      : null,
      author: {
        id: post.author.id,
        name:
          post.author.profile?.displayName ??
          post.author.profile?.username ??
          post.author.email,
        avatar: post.author.profile?.avatarUrl ?? null,
        username: post.author.profile?.username ?? null,
      },
    }));

    return blogItems;
}

export async function getMyPosts(userId) {
    const posts = await prisma.blogPost.findMany({
        where: { userId },
        orderBy: [
          { status: "asc" },
          { updatedAt: "desc" },
        ],
        select: {
          id: true,
          slug: true,
          title: true,
          tags: true,
          status: true,
          publishedAt: true,
          author: {
            select: {
              profile: {
                select: {
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      // if (!posts) {
      //   return NextResponse.json(
      //     { ok: false, message: "No post not found" },
      //     { status: 404 },
      //   );
      // }
    
  //       // drafts only visible to author
  // if (posts.status === "DRAFT") {
  //   const currentUser = await getCurrentUser();
  //   if (!currentUser || currentUser.id !== post.userId) {
  //     return NextResponse.json(
  //       { ok: false, message: "Not authorized" },
  //       { status: 403 },
  //     );
  //   }
  // }
      
      const items = posts.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        tags: post.tags,
        status: post.status,
        published: post.publishedAt
          ? new Intl.DateTimeFormat("en-GB", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            }).format(post.publishedAt)
          : null,
        author: {
          avatar: post.author?.profile?.avatarUrl ?? null,
        },
      }));

      return items;
//   const posts = await prisma.blogPost.findMany({
//     where: { userId },
//     orderBy: [
//       { status: "asc" },
//       { updatedAt: "desc" },
//     ],
//     include: {
//       author: {
//         include: {
//           profile: {
//             select: {
//               avatarUrl: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   return posts.map((post) => ({
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
}


export async function getBlogBySlug(slug) {
    // 1, Guard against bad input so Prisma never gets slug: undefined
  if (!slug || typeof slug !== "string") {
    console.log("getBlogBySlug called with bad slug:", slug);
    return null;
  }

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
      excerpt: true,
      coverUrl: true,
      tags: true,
      status: true,
      publishedAt: true,
      userId: true, // needed for draft access check
      author: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              displayName: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
    // include: {
    //   author: {
    //     include: {
    //       profile: {
    //         select: {
    //           displayName: true,
    //           username: true,
    //           avatarUrl: true,
    //         },
    //       },
    //     },
    //   },
    // },
  });

  if (!post) {
    return null;
  }

  // drafts only visible to author
  if (post.status === "DRAFT") {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.id !== post.userId) {
      // mirror your API behaviour = treat as not found / forbidden
      return null; // for the page, "not found" is fine
    }
  }

  // shape exactly what BlogContent expects
  const formattedPublished = post.publishedAt
    ? new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }).format(post.publishedAt)
    : null;

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    cover: post.coverUrl,
    tags: post.tags,
    status: post.status,
    published: formattedPublished, // ✅ what BlogContent uses
    author: {
      id: post.author.id,
      name:
        post.author.profile?.displayName ??
        post.author.profile?.username ??
        post.author.email,
      avatar: post.author.profile?.avatarUrl ?? null,
      username: post.author.profile?.username ?? null,
    },
  };
}


// export async function patchBlog(){
//   const currentUser = await getCurrentUser();

//     if (!currentUser) {
//       return "Not Authenticated"
//     }


// }
