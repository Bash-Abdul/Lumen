// src/app/api/blog/route.js
import { NextResponse } from "next/server";
import prisma from "@/server/db/prisma";
import { getCurrentUser } from "@/server/auth/auth-server";
import { BlogCreateSchema } from "@/features/blog/validation/blog";

// basic slug helper
function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /api/blog - public list of published posts
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limitRaw = searchParams.get("limit") || "20";
    let limit = Number(limitRaw);
    if (Number.isNaN(limit) || limit < 1 || limit > 100) {
      limit = 20;
    }

    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: limit,
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
      publishedAt: post.publishedAt,
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

    return NextResponse.json({
      ok: true,
      message: "Blogs fetched successfully",
      blogItems,              // 👈 match helper
    });
  } catch (err) {
    console.error("GET /api/blog error", err);
    return NextResponse.json(
      { ok: false, message: "Server error fetching blogs" },
      { status: 500 },
    );
  }
}


// POST /api/blog - create new blog post (draft by default)
export async function POST(req) {
  try {

    // get current user/session from session/nextAuth
    const currentUser = await getCurrentUser();

    // check authentication and return 401 if no one is logged in
    if (!currentUser) {
      return NextResponse.json(
        { ok: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    // parse and validate request body
    const json = await req.json();


    // zod validator BlogCreateSchema is used to validate the json request body
    const parsed = BlogCreateSchema.safeParse(json);

    // if validation fails, return 400 with the first error message, as parsed returns an object with { success: boolean, data } or { success: boolean, error }
    if (!parsed.success) {
      // 
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          ok: false,
          message: firstIssue?.message || "Invalid request body",
        },
        { status: 400 },
      );
    }


    // validated data is then destructured from parsed.data
    const { title, content, excerpt, coverUrl, tags, status } = parsed.data;

    // turns title into slug e.g 'My title' -> 'my-title'
    let baseSlug = slugify(title);

    // if slug is empty (e.g title was all special chars or empty), use a timestamp-based slug 
    if (!baseSlug) {
      baseSlug = `post-${Date.now()}`;
    }



    // ensure unique slug
    let slug = baseSlug;
    let suffix = 1;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      // check if slug exists in db
      const existing = await prisma.blogPost.findUnique({
        where: { slug },
        select: { id: true },
      });
      
      // if not existing, break loop
      if (!existing) break;
      // else, append suffix to baseSlug, so if slug 'my-title' exists, next will be 'my-title-1', then 'my-title-2' etc..
      slug = `${baseSlug}-${suffix++}`;
    }

    const rawExcerpt =
  excerpt && excerpt.trim().length > 0
    ? excerpt.trim()
    : content
        .replace(/\s+/g, " ") // collapse weird whitespace
        .slice(0, 200)
        .trim();

const finalExcerpt = rawExcerpt || null;

    // determines final status, only 'PUBLISHED' or 'DRAFT' allowed
    const finalStatus = status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    
    // create blog post in db
    const post = await prisma.blogPost.create({
      data: {
        userId: currentUser.id,
        slug,
        title: title.trim(),
        content,
        excerpt: finalExcerpt,
        coverUrl: coverUrl?.trim() || null,
        tags: tags ?? [],
        status: finalStatus,
        publishedAt: finalStatus === "PUBLISHED" ? new Date() : null,
      },
    });

    return NextResponse.json({ ok: true,message: 'Blog created successfully', post }, { status: 201 });
  } catch (err) {
    // console.error("Blog create error", err);
    // return NextResponse.json(
    //   { ok: false, message: "Server error" },
    //   { status: 500 },
    // );
     console.error("Blog create error", err);
  return NextResponse.json(
    {
      ok: false,
      message: err instanceof Error ? err.message : "Server error",
      error: String(err),
    },
    { status: 500 },
  );
  }
}
