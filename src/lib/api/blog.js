import { blogs } from "../mockData/blogs";

export async function getBlogs() {
  // TODO: replace with GET /api/blogs
  return Promise.resolve(blogs);
}

export async function getBlogBySlug(slug) {
  // TODO: replace with GET /api/blogs/:slug
  const post = blogs.find((b) => b.slug === slug);
  return Promise.resolve(post || null);
}

export async function createBlogPost(payload) {
  // TODO: replace with POST /api/blogs
  const now = new Date();
  const newPost = {
    slug:
      payload.slug ||
      payload.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, ""),
    title: payload.title,
    excerpt: payload.excerpt || payload.content?.slice(0, 120),
    cover:
      payload.cover ||
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
    author: payload.author,
    tags: payload.tags || [],
    published: now.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    content: payload.content,
  };
  blogs.unshift(newPost);
  return Promise.resolve(newPost);
}
