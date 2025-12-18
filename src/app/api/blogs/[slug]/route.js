// src/app/api/blog/[slug]/route.js
import { NextResponse } from "next/server";
import prisma from "@/server/db/prisma";
import { getCurrentUser } from "@/server/auth/auth-server";
import { BlogUpdateSchema, BlogStatusSchema } from "@/features/blog/validation/blog";

// GET /api/blog/[slug] - single post
export async function GET(_req, { params }) {
  const { slug } = params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
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

  if (!post) {
    return NextResponse.json(
      { ok: false, message: "Post not found" },
      { status: 404 },
    );
  }

  // drafts only visible to author
  if (post.status === "DRAFT") {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.id !== post.userId) {
      return NextResponse.json(
        { ok: false, message: "Not authorized" },
        { status: 403 },
      );
    }
  }

  const result = {
    id: post.id,
    slug: post.slug,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    cover: post.coverUrl,
    tags: post.tags,
    status: post.status,
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
  };

  return NextResponse.json({ ok: true, post: result });
}

// PATCH /api/blog/[slug] - update / publish / unpublish
export async function PATCH(req, { params }) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { ok: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const { slug } = params;
    const json = await req.json();

    const parsed = BlogUpdateSchema.safeParse(json);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        {
          ok: false,
          message: firstIssue?.message || "Invalid request body",
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!post) {
      return NextResponse.json(
        { ok: false, message: "Post not found" },
        { status: 404 },
      );
    }

    if (post.userId !== currentUser.id) {
      return NextResponse.json(
        { ok: false, message: "Not authorized" },
        { status: 403 },
      );
    }

    let nextStatus = post.status;
    if (data.status) {
      const statusParsed = BlogStatusSchema.safeParse(data.status);
      if (statusParsed.success) {
        nextStatus = statusParsed.data;
      }
    }

    let nextPublishedAt = post.publishedAt;
    if (
      post.status === "DRAFT" &&
      nextStatus === "PUBLISHED" &&
      !post.publishedAt
    ) {
      nextPublishedAt = new Date();
    }
    // if you want to null it when going back to draft, you can tweak here

    const updated = await prisma.blogPost.update({
      where: { slug },
      data: {
        title: data.title === undefined ? undefined : data.title.trim(),
        content: data.content === undefined ? undefined : data.content,
        excerpt: data.excerpt === undefined ? undefined : data.excerpt.trim(),
        coverUrl:
          data.coverUrl === undefined ? undefined : data.coverUrl.trim(),
        tags: data.tags === undefined ? undefined : data.tags,
        status: nextStatus,
        publishedAt: nextPublishedAt,
      },
    });

    return NextResponse.json({ ok: true, post: updated });
  } catch (err) {
    console.error("Blog update error", err);
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/blog/[slug] - delete post
export async function DELETE(_req, { params }) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { ok: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const { slug } = params;

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, userId: true },
    });

    if (!post) {
      return NextResponse.json(
        { ok: false, message: "Post not found" },
        { status: 404 },
      );
    }

    if (post.userId !== currentUser.id) {
      return NextResponse.json(
        { ok: false, message: "Not authorized" },
        { status: 403 },
      );
    }

    await prisma.blogPost.delete({
      where: { slug },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Blog delete error", err);
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 },
    );
  }
}
