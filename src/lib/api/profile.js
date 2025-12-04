import { users } from "../mockData/users";
import { posts } from "../mockData/posts";
import { blogs } from "../mockData/blogs";

export async function getProfile(username) {
  // TODO: replace with GET /api/users/:username
  const user = users.find((u) => u.username === username);
  if (!user) return null;
  const userPosts = posts.filter((p) => p.username === username);
  const userReposts = posts.filter(
    (p) => p.username !== username && p.reposted
  );
  const userBlogs = blogs.filter((b) =>
    b.author?.name?.toLowerCase().includes(user.name.toLowerCase())
  );
  return Promise.resolve({
    ...user,
    posts: userPosts,
    reposts: userReposts,
    blogs: userBlogs,
  });
}

export async function updateProfile(username, payload) {
  // TODO: replace with PATCH /api/users/:username
  const existing = users.find((u) => u.username === username);
  if (!existing) return null;
  const updated = { ...existing, ...payload };
  return Promise.resolve(updated);
}
