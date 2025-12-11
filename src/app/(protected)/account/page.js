"use client";

import { useState, useEffect } from "react";
// import Button from "../../components/common/Button";
import Button from "@/components/common/Button";
// import { useAuths } from "../../lib/hooks/useAuthMock";
import { useAuths } from "@/lib/hooks/useAuthMock";
import { getProfile, updateProfile } from "@/lib/api/profile";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

function Section({ title, children }) {
  return (
    <div className="card p-5 space-y-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="h-11 rounded-xl bg-zinc-800/70" />
        <div className="h-11 rounded-xl bg-zinc-800/70" />
      </div>
      <div className="h-11 rounded-xl bg-zinc-800/70" />
      <div className="h-24 rounded-xl bg-zinc-800/70" />
      <div className="h-9 w-28 rounded-full bg-zinc-800/70" />
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { users, setUser } = useAuths();
  const [form, setForm] = useState({
    name: "",
    username: "",
    bio: "",
    location: "",
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState("");

  // const handleSave = (e) => {
  //   e.preventDefault();
  //   setUser((prev) => ({ ...prev, ...form }));
  // };

  async function getProfileData() {
    try {
      setError("");
      setLoadingProfile(true);

      // consume api /profile
      const res = await api.get("/profile");
      const { ok, profile } = res.data;
      if (!ok) {
        throw new Error(res.data?.message || "Failed to load profile");
      }

      setForm({
        name: profile.displayName || "",
        username: profile.username || "",
        bio: profile.bio || "",
        location: profile.location || "",
      });
    } catch (err) {
      console.error("Failed to load profile", err);
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoadingProfile(false);
    }
  }

  useEffect(() => {
    getProfileData();
  }, []);

  // Update Profile function
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSavingProfile(true);

    try {
      const payload = {
        displayName: form.name,
        username: form.username,
        bio: form.bio,
        location: form.location,
      };

      const res = await api.patch("/profile", payload);
      const { ok, profile, message } = res.data;
      if (!ok) {
        throw new Error(message || "Failed to update profile");
      }

      // Sync form with whatever backend returned
      setForm({
        name: profile.displayName || "",
        username: profile.username || "",
        bio: profile.bio || "",
        location: profile.location || "",
      });
      router.push("/profile");
    } catch (error) {
      console.error("Profile update error", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const [updateMock, setUpdateMock] = useState(false);

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
          {loadingProfile ? (
            <ProfileSkeleton />
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-3">
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

              {error && <p className="text-xs text-red-400">{error}</p>}

              <Button type="submit" size="sm" disabled={savingProfile}>
                {savingProfile ? "Saving..." : "Save profile"}
              </Button>
              <p className="text-xs text-zinc-400">
                Updates your profile via PATCH /api/profile.
              </p>
            </form>
          )}
        </Section>

        <div className="space-y-4">
          <Section title="Account">
            <div className="space-y-2 text-sm text-zinc-300">
              {!updateMock ? (
                <>
                  <p className="mb-4">Email: you@example.com</p>
                  <p className="mb-4">Password: •••••••• (placeholder)</p>
                </>
              ) : (
                <>
                  <input
                    type="email"
                    className="p-2 bg-stone-900 block mb-2"
                    placeholder="enter new email"
                  />
                  <input
                    type="password"
                    className="p-2 bg-stone-900 block mb-2"
                    placeholder="enter new password"
                  />
                </>
              )}
              <Button
                onClick={() => setUpdateMock((prev) => !prev)}
                variant="secondary"
                size="sm"
              >
                {updateMock ? "save update" : "Update credentials (mock)"}
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
              variant={users?.isCreator ? "primary" : "secondary"}
              size="sm"
              onClick={() =>
                setUser((prev) => ({ ...prev, isCreator: !prev?.isCreator }))
              }
            >
              {users?.isCreator ? "Creator enabled" : "Enable creator"}
            </Button>
          </Section>
          <Section title="Plan">
            <p className="text-sm text-zinc-300">Current plan: {users?.plan}</p>
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
