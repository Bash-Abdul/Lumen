// actions/posts.js
"use server";

import { prisma } from "@/server/db/prisma";
import { getCurrentUser } from "@/server/auth/auth-server";
import { revalidatePath } from "next/cache";
import { BlogUpdateSchema, BlogCreateSchema } from "@/features/blog/validation/blog";
import { redirect } from "next/navigation";


export async function createPost(formData) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { error: "Not authenticated" };
    }

    const title = formData.get("title");
    const content = formData.get("content");
    const coverUrl = formData.get("coverUrl") || null;
    const tagsInput = formData.get("tags") || "";
    const status = formData.get("status") || "DRAFT"; // DRAFT or PUBLISHED

    // // Validation
    // if (!title || title.trim().length < 3) {
    //   return { error: "Title must be at least 3 characters" };
    // }

    // if (!content || content.trim().length < 10) {
    //   return { error: "Content must be at least 10 characters" };
    // }

    // Parse tags
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

       // ✅ Validate with Zod
    const validated = BlogCreateSchema.safeParse({
      title,
      content,
      coverUrl: coverUrl || null,
      tags,
      status,
    });

    if (!validated.success) {
      const firstError = validated.error.errors[0];
      return { 
        error: firstError.message || "Validation failed",
        field: firstError.path[0] // Optional: which field failed
      };
    }

    const data = validated.data;

    // Generate slug from title
    const slug = data.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if slug exists
    const existing = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (existing) {
      return { error: "A post with this title already exists" };
    }

    // Create post with validated data
    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        coverUrl: data.coverUrl,
        tags: data.tags || [],
        status: data.status || "DRAFT",
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        userId: currentUser.id,
      },
    });

    revalidatePath("/learn");
    revalidatePath("/learn/my-posts");

    return { success: true, slug: post.slug };
  } catch (err) {
    console.error("Create post error:", err);
    return { error: "Failed to create post" };
  }
}



export async function deletePost(slug) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { ok: false, code: "NOT_AUTHENTICATED", error: "Not authenticated" };
    }

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, userId: true },
    });

    if (!post) {
      return { ok: false, code: "NOT_FOUND", error: "Post not found" };
    }

    if (post.userId !== currentUser.id) {
      return {    ok: false,
        code: "FORBIDDEN", error: "Not authorized to delete this post" };
    }

    await prisma.blogPost.delete({
      where: { slug },
    });

    // Refresh the my-posts page
    revalidatePath("/learn");
    revalidatePath("/learn/my-posts");
    
    return { success: true };
  } catch (err) {
    console.error("Blog delete error:", err);
    return { 
        ok: false,
        code: "SERVER_ERROR",
        error: "Failed to delete post",
     };
  }
}


export async function updatePost(slug, formData) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { error: "Not authenticated" };
    }

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, userId: true, status: true, publishedAt: true },
    });

    if (!post) {
      return { error: "Post not found" };
    }

    if (post.userId !== currentUser.id) {
      return { error: "Not authorized" };
    }

    const title = formData.get("title");
    const content = formData.get("content");
    const coverUrl = formData.get("coverUrl") || null;
    const tagsInput = formData.get("tags") || "";
    const status = formData.get("status") || post.status;

    // // Validation
    // if (!title || title.trim().length < 3) {
    //   return { error: "Title must be at least 3 characters" };
    // }

    // if (!content || content.trim().length < 10) {
    //   return { error: "Content must be at least 10 characters" };
    // }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

          // ✅ Validate with Zod
    const validated = BlogUpdateSchema.safeParse({
      title,
      content,
      coverUrl: coverUrl || undefined,
      tags: tags.length > 0 ? tags : undefined,
      status,
    });

    if (!validated.success) {
      const firstError = validated.error.errors[0];
      return { 
        error: firstError.message || "Validation failed",
        field: firstError.path[0]
      };
    }

    const data = validated.data;

    // If publishing for first time, set publishedAt
    let publishedAt = post.publishedAt;
    if (post.status === "DRAFT" && data.status === "PUBLISHED" && !publishedAt) {
      publishedAt = new Date();
    }

    // await prisma.blogPost.update({
    //   where: { slug },
    //   data: {
    //     title: title.trim(),
    //     content,
    //     coverUrl,
    //     tags,
    //     status,
    //     publishedAt,
    //   },
    // });

    // Update with validated data
    await prisma.blogPost.update({
      where: { slug },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.coverUrl !== undefined && { coverUrl: data.coverUrl }),
        ...(data.tags && { tags: data.tags }),
        ...(data.status && { status: data.status }),
        publishedAt,
      },
    });



    revalidatePath("/learn");
    revalidatePath("/learn/my-posts");
    revalidatePath(`/learn/${slug}`);

    return { success: true };
  } catch (error) {
    console.error("Update post error:", error);
    return { error: "Failed to update post" }; 
  }
}
