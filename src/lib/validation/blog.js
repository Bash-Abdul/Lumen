// src/lib/validation/blog.js
import { z } from "zod";

export const BlogStatusSchema = z.enum(["DRAFT", "PUBLISHED"]);

export const BlogCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters"),
  content: z
    .string()
    .min(1, "Content is required"),
  excerpt: z
    .string()
    .trim()
    .max(400, "Excerpt should be at most 400 characters")
    .optional(),
  coverUrl: z
    .string()
    .trim()
    .url("Cover must be a valid URL")
    .optional()
    .nullable(),
  tags: z
    .array(z.string().trim())
    .max(20, "Too many tags (max 20)")
    .optional(),
  status: z
    .enum(["DRAFT", "PUBLISHED"])
    .optional(),
});

export const BlogUpdateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .optional(),
  content: z
    .string()
    .min(1, "Content is required")
    .optional(),
  excerpt: z
    .string()
    .trim()
    .max(400, "Excerpt should be at most 400 characters")
    .optional(),
  coverUrl: z
    .string()
    .trim()
    .url("Cover must be a valid URL")
    .optional(),
  tags: z
    .array(z.string().trim())
    .max(20, "Too many tags (max 20)")
    .optional(),
  status: BlogStatusSchema.optional(),
});
