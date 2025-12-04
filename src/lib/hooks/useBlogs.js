'use client';

import { useEffect, useState } from "react";
import { createBlogPost, getBlogBySlug, getBlogs } from "../api/blog";

export function useBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getBlogs()
      .then(setBlogs)
      .finally(() => setLoading(false));
  }, []);

  const addBlog = async (payload) => {
    const newPost = await createBlogPost(payload);
    setBlogs((prev) => [newPost, ...prev]);
    return newPost;
  };

  return { blogs, loading, addBlog };
}

export async function fetchBlog(slug) {
  return getBlogBySlug(slug);
}
