import { users } from "../mockData/users";
import { posts } from "../mockData/posts";
import { blogs } from "../mockData/blogs";

export async function searchPeople(query) {
  // TODO: replace with GET /api/search/people?q={query}
  const q = query.toLowerCase();
  return Promise.resolve(
    users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)
    )
  );
}

export async function searchImages(query) {
  // TODO: replace with GET /api/search/images?q={query}
  const q = query.toLowerCase();
  return Promise.resolve(
    posts.filter(
      (p) =>
        p.caption.toLowerCase().includes(q) ||
        p.tags?.some((tag) => tag.toLowerCase().includes(q))
    )
  );
}

export async function searchBlogs(query) {
  // TODO: replace with GET /api/search/blogs?q={query}
  const q = query.toLowerCase();
  return Promise.resolve(
    blogs.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.excerpt.toLowerCase().includes(q) ||
        b.tags?.some((tag) => tag.toLowerCase().includes(q))
    )
  );
}

export async function searchAll(query) {
  const [people, images, blogPosts] = await Promise.all([
    searchPeople(query),
    searchImages(query),
    searchBlogs(query),
  ]);
  return { people, images, blogs: blogPosts };
}
