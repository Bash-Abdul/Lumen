import { users } from "../mockData/users";

export async function getCurrentUser() {
  // TODO: replace with GET /api/auth/me
  return Promise.resolve(users[0]);
}

export async function login({ email, password }) {
  // TODO: replace with POST /api/auth/login
  const user = users[0];
  return Promise.resolve({ user, token: "mock-token" });
}

export async function logout() {
  // TODO: replace with POST /api/auth/logout
  return Promise.resolve(true);
}
