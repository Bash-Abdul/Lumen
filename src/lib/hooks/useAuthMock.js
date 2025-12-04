'use client';

import { createContext, useContext, useMemo, useState } from "react";

const initialUser = {
  id: "user-1",
  name: "Atlas Gray",
  username: "atlas",
  avatar:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=60",
  bio: "Portrait & editorial photographer. Light chaser. Based in Berlin.",
  isCreator: true,
  plan: "Pro",
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [users, setUser] = useState(initialUser);

  const value = useMemo(
    () => ({
      users,
      setUser,
      login: (nextUser) => setUser(nextUser),
      logout: () => setUser(null),
    }),
    [users]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuths() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
