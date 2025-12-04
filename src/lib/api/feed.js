import { posts } from "../mockData/posts";
import { users } from "../mockData/users";

export async function getFeed({ type = "forYou", cursor = 0, limit = 4 } = {}) {
  // TODO: replace with GET /api/feed?type={forYou|following}&cursor=<number>
  const filtered = posts.filter((p) =>
    type === "following" ? p.audience === "following" : true
  );
  const slice = filtered.slice(cursor, cursor + limit);
  const enriched = slice.map((post) => ({
    ...post,
    user: users.find((u) => u.id === post.userId),
  }));

  return Promise.resolve({
    items: enriched,
    nextCursor: cursor + limit >= filtered.length ? 0 : cursor + limit,
  });
}

export async function getPostById(id) {
  // TODO: replace with GET /api/posts/:id
  const post = posts.find((p) => p.id === id);
  return Promise.resolve(post || null);
}
