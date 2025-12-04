'use client';

import { useState } from "react";
import Button from "../../components/common/Button";
import { useAuth } from "../../lib/hooks/useAuthMock";

function Section({ title, children }) {
  return (
    <div className="card p-5 space-y-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}

export default function AccountPage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    username: user?.username || "",
    bio: user?.bio || "",
    location: user?.location || "",
  });

  const handleSave = (e) => {
    e.preventDefault();
    setUser((prev) => ({ ...prev, ...form }));
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
          Account
        </p>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-sm text-zinc-400">
          Profile, account, creator toggle, and plan information.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
        <Section title="Profile">
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Name"
                className="rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
              />
              <input
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                placeholder="Username"
                className="rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
              />
            </div>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Location"
              className="rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
            />
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Bio"
              rows={3}
              className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
            />
            <Button type="submit" size="sm">
              Save (mock)
            </Button>
            <p className="text-xs text-zinc-400">
              Will call PATCH /api/users/:username later.
            </p>
          </form>
        </Section>

        <div className="space-y-4">
          <Section title="Account">
            <div className="space-y-2 text-sm text-zinc-300">
              <p>Email: you@example.com</p>
              <p>Password: •••••••• (placeholder)</p>
              <Button variant="secondary" size="sm">
                Update credentials (mock)
              </Button>
              <p className="text-xs text-zinc-500">
                Future endpoint: POST /api/account/update
              </p>
            </div>
          </Section>
          <Section title="Creator mode">
            <p className="text-sm text-zinc-300">
              Toggle to unlock Hub and portfolio tools.
            </p>
            <Button
              variant={user?.isCreator ? "primary" : "secondary"}
              size="sm"
              onClick={() =>
                setUser((prev) => ({ ...prev, isCreator: !prev?.isCreator }))
              }
            >
              {user?.isCreator ? "Creator enabled" : "Enable creator"}
            </Button>
          </Section>
          <Section title="Plan">
            <p className="text-sm text-zinc-300">Current plan: {user?.plan}</p>
            <p className="text-xs text-zinc-500">
              Billing endpoints will live under /api/billing and integrate a
              payment provider.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
