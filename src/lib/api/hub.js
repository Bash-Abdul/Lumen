import { collections } from "../mockData/collections";
import { users } from "../mockData/users";

export async function getHub(username) {
  // TODO: replace with GET /api/hub (authed user) or /api/hub/:username
  const user = users.find((u) => u.username === username);
  if (!user) return null;
  const userCollections = collections.filter((c) => c.userId === user.id);
  return Promise.resolve({ user, collections: userCollections });
}

export async function createCollection(username, payload) {
  // TODO: replace with POST /api/hub/collections
  const owner = users.find((u) => u.username === username);
  const newCollection = {
    id: `col-${collections.length + 1}`,
    userId: owner?.id,
    ...payload,
    count: payload.count || 0,
    featured: payload.featured || "New",
  };
  collections.unshift(newCollection);
  return Promise.resolve(newCollection);
}
