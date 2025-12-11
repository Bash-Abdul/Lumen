import { blogs } from "../mockData/blogs";


const base =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXTAUTH_URL ||
  "http://localhost:3000";

export async function getBlogs() {
  // // TODO: replace with GET /api/blogs
  // return Promise.resolve(blogs);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/blogs`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch blogs");
  }

  const data = await res.json();

  if (!data.ok) {
    throw new Error(data.message || "Failed to fetch blogs");
  }

  return data.blogItems;

}

export async function getBlogBySlug(slug) {
  // TODO: replace with GET /api/blogs/:slug
  // const post = blogs.find((b) => b.slug === slug);
  // return Promise.resolve(post || null);


}

export async function createBlogPost({ title, content, cover, tags, publish }) {
  // // TODO: replace with POST /api/blogs
  // const now = new Date();
  // const newPost = {
  //   slug:
  //     payload.slug ||
  //     payload.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, ""),
  //   title: payload.title,
  //   excerpt: payload.excerpt || payload.content?.slice(0, 120),
  //   cover:
  //     payload.cover ||
  //     "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
  //   author: payload.author,
  //   tags: payload.tags || [],
  //   published: now.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
  //   content: payload.content,
  //   status: payload.status || "draft",
  // };
  // blogs.unshift(newPost);
  // return Promise.resolve(newPost);

  const excerpt =
    content.length > 200
      ? content.slice(0, 200).trim() + "..."
      : content.trim();

  const payload = {
    title: title.trim(),
    content,
    excerpt,
    coverUrl: cover?.trim() || null,
    tags: tags || [],
    status: publish ? "PUBLISHED" : "DRAFT", // 👈
  };

  const res = await api.post("/blogs", payload);
  const { ok, post, message } = res.data;

  if (!ok) {
    throw new Error(message || "Failed to create blog");
  }

  return post;
}


export async function getMyBlogs() {
  // const params = new URLSearchParams();

  // if (status) params.set("status", status); // "DRAFT" | "PUBLISHED"
  // if (limit) params.set("limit", String(limit)); // 1–100

  // const query = params.toString();
  // const url = query ? `/blog/mine?${query}` : "/blog/mine";

  // const res = await api.get(url);
  // const { ok, items, message } = res.data;

  // if (!ok) {
  //   throw new Error(message || "Failed to load your posts");
  // }

  // return items; // array of posts

    const res = await fetch("/api/blogs/mine", {
    cache: "no-store",
  });

  if (!res.ok) {
    // this is where you'll see 401 / 404 / 500 etc
    throw new Error(`Failed to fetch your blogs (${res.status})`);
  }

  const data = await res.json();

  if (!data.ok) {
    throw new Error(data.message || "Failed to fetch your blogs");
  }

  return data.items;

  //  const params = new URLSearchParams();

  // if (status) {
  //   // "DRAFT" or "PUBLISHED"
  //   params.set("status", status);
  // }

  // if (limit) {
  //   params.set("limit", String(limit));
  // }

  // const query = params.toString();
  // const url = `/api/blogs/mine${query ? `?${query}` : ""}`;

  // const res = await fetch(url, {
  //   cache: "no-store",
  // });

  // if (!res.ok) {
  //   throw new Error(`Failed to fetch your blogs (${res.status})`);
  // }

  // const data = await res.json();

  // if (!data.ok) {
  //   throw new Error(data.message || "Failed to fetch your blogs");
  // }

  // // matches your API: { ok: true, items: posts }
  // return data.items;
}