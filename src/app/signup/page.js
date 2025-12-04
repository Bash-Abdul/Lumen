'use client';

import { useState } from "react";
import Link from "next/link";
import Button from "../../components/common/Button";
import { useAuths } from "../../lib/hooks/useAuthMock";

export default function SignupPage() {
  const { setUser } = useAuths();
  const [form, setForm] = useState({
    name: "New Photographer",
    username: "newuser",
    email: "new@example.com",
    password: "password",
  });
  const [status, setStatus] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();
    setStatus("Creating account...");
    // Mock signup flow: in real backend, POST /api/auth/register then fetch user profile.
    setUser({
      id: "user-temp",
      name: form.name,
      username: form.username,
      avatar:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=60",
      bio: "",
      isCreator: false,
      plan: "Free",
    });
    setStatus("Signed up (mock). Replace with POST /api/auth/register.");
  };

  return (
    <div className="flex items-center justify-center h-full">
      <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
          Join
        </p>
        <h1 className="text-3xl font-semibold">Create account</h1>
        <p className="text-sm text-zinc-400">
          Mock signup — hooks into real auth service later.
        </p>
      </div>

      <form onSubmit={handleSignup} className="card p-6 space-y-4">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Name"
          className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
          required
        />
        <input
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          placeholder="Username"
          className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
          required
        />
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          type="email"
          placeholder="Email"
          className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
          required
        />
        <input
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          type="password"
          placeholder="Password"
          className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
          required
        />
        <Button type="submit" className="w-full">
          Sign up
        </Button>
        {status && <p className="text-xs text-zinc-400">{status}</p>}
        <p className="text-sm text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-300 hover:text-emerald-200">
            Log in
          </Link>
        </p>
      </form>
    </div>
    </div>
  );
}
