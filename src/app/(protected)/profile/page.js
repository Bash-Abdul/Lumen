'use client';

import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/common/Button";
import ProfileTabs from "../../../components/profile/ProfileTabs";
import Avatar from "../../../components/common/Avatar";
import { useAuths } from "../../../lib/hooks/useAuthMock";
import { getProfile, updateProfile } from "../../../lib/api/profile";
import Link from "next/link";

const TABS = [
  { key: "photos", label: "Recents" },
  { key: "reposts", label: "Reposts" },
];

function ImageGrid({ items = [] }) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
      {items.map((item) => (
        <div key={item.id} className="break-inside-avoid">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image}
            alt={item.caption}
            className="w-full h-auto object-cover block"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
      <p className="text-xs uppercase text-zinc-500 tracking-wide">{label}</p>
      <p className="text-lg font-semibold">{value ?? 0}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { users } = useAuths();
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("photos");
  const [showStats, setShowStats] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    avatar: "",
    username: "",
    bio: "",
    website: "",
    email: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    snapchat: "",
  });

  useEffect(() => {
    const username = users?.username || "atlas";
    getProfile(username).then((p) => {
      setProfile(p);
      setForm({
        avatar: p?.avatar || "",
        username: p?.username || "",
        bio: p?.bio || "",
        website: p?.links?.find((l) => l.label.toLowerCase().includes("site"))?.url || "",
        email: p?.email || "",
        instagram: p?.links?.find((l) => l.label.toLowerCase().includes("instagram"))?.url || "",
        twitter: p?.links?.find((l) => l.label.toLowerCase().includes("twitter"))?.url || "",
        linkedin: p?.links?.find((l) => l.label.toLowerCase().includes("linkedin"))?.url || "",
        snapchat: p?.links?.find((l) => l.label.toLowerCase().includes("snap"))?.url || "",
      });
    });
  }, [users]);

  const stats = useMemo(() => {
    if (!profile) return {};
    const likes = profile.posts?.reduce((sum, p) => sum + (p.likes || 0), 0);
    const reposts = profile.posts?.reduce((sum, p) => sum + (p.reposts || 0), 0);
    return {
      photos: profile.posts?.length || 0,
      reposts: profile.reposts?.length || 0,
      likes,
      repostsCount: reposts,
      followers: profile.counters?.followers || 0,
      following: profile.counters?.following || 0,
    };
  }, [profile]);

  if (!profile) {
    return (
      <div className="card p-6">
        <p className="text-sm text-zinc-300">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar src={profile.avatar} size={72} />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
              Profile
            </p>
            <h1 className="text-3xl font-semibold">{profile.name}</h1>
            <p className="text-sm text-zinc-400">@{profile.username}</p>
            <p className="text-lg text-white"> {profile.bio} </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
            Edit profile
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowStats(true)}>
            Statistics
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLinks(true)}
          className="border border-zinc-800"
        >
          View links & socials
        </Button>
        <div className="flex gap-2 flex-wrap text-xs text-zinc-400">
          {["website", "instagram", "twitter", "linkedin", "snapchat"]
            .filter((key) => form[key])
            .slice(0, 3)
            .map((key) => (
              <span
                key={key}
                className="px-2 py-1 rounded-full border border-zinc-800 bg-zinc-900/60"
              >
                {key}
              </span>
            ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <ProfileTabs active={tab} onChange={setTab} tabs={TABS} />
        <div className="text-sm text-zinc-400">
          {tab === "photos"
            ? `${profile.posts.length} photos`
            : `${profile.reposts.length} reposts`}
        </div>
      </div>

      {tab === "photos" && (
        <>
          {profile.posts.length === 0 ? (
            <div className="flex items-center justify-between border border-dashed border-zinc-800 rounded-xl p-4 bg-zinc-950/50">
              <p className="text-sm text-zinc-400">No posts yet.</p>
              <div className="relative">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCreate((prev) => !prev)}
                >
                  ＋
                </Button>
                {showCreate && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-zinc-800 bg-zinc-950 shadow-xl z-10">
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
                      onClick={() => {
                        setShowCreate(false);
                        alert("Placeholder: open photo upload flow");
                      }}
                    >
                      New photo post
                    </button>
                    
                    <Link
                      href="/learn/new"
                      className="block px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
                      onClick={() => setShowCreate(false)}
                    >
                      New blog post
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <ImageGrid items={profile.posts} />
          )}
        </>
      )}
      {tab === "reposts" && <ImageGrid items={profile.reposts} />}

      {showStats && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="card p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Profile stats</h3>
              <button
                onClick={() => setShowStats(false)}
                className="text-sm text-zinc-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Stat label="Photos" value={stats.photos} />
              <Stat label="Reposts" value={stats.reposts} />
              <Stat label="Likes" value={stats.likes} />
              <Stat label="Reposts gained" value={stats.repostsCount} />
              <Stat label="Followers" value={stats.followers} />
              <Stat label="Following" value={stats.following} />
            </div>
            <p className="text-xs text-zinc-500">
              Mock metrics from local data. Wire to real analytics later.
            </p>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowEdit(false)}
          />
          <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit profile</h3>
              <button
                onClick={() => setShowEdit(false)}
                className="text-sm text-zinc-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar src={form.avatar || profile.avatar} size={64} />
                <input
                  value={form.avatar}
                  onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                  placeholder="Avatar URL"
                  className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
                />
              </div>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Username"
                className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
              />
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="About / description"
                rows={3}
                className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
              />
              <input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="Website / portfolio URL"
                className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
              />
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email"
                type="email"
                className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={form.instagram}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="Instagram URL"
                  className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
                />
                <input
                  value={form.twitter}
                  onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                  placeholder="Twitter / X URL"
                  className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
                />
                <input
                  value={form.linkedin}
                  onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                  placeholder="LinkedIn URL"
                  className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
                />
                <input
                  value={form.snapchat}
                  onChange={(e) => setForm({ ...form, snapchat: e.target.value })}
                  placeholder="Snapchat URL"
                  className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
                />
              </div>
              <Button
                onClick={async () => {
                  const updatedLinks = [
                    form.website && { label: "Website", url: form.website },
                    form.instagram && { label: "Instagram", url: form.instagram },
                    form.twitter && { label: "Twitter", url: form.twitter },
                    form.linkedin && { label: "LinkedIn", url: form.linkedin },
                    form.snapchat && { label: "Snapchat", url: form.snapchat },
                  ].filter(Boolean);

                  const updated = {
                    ...profile,
                    avatar: form.avatar || profile.avatar,
                    username: form.username || profile.username,
                    bio: form.bio,
                    email: form.email,
                    links: updatedLinks,
                  };
                  setProfile(updated);
                  // TODO: replace with PATCH /api/users/:username
                  await updateProfile(profile.username, updated);
                  setShowEdit(false);
                }}
              >
                Save changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {showLinks && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="card p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Links & socials</h3>
              <button
                onClick={() => setShowLinks(false)}
                className="text-sm text-zinc-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { label: "Website", url: form.website },
                { label: "Email", url: form.email },
                { label: "Instagram", url: form.instagram },
                { label: "Twitter", url: form.twitter },
                { label: "LinkedIn", url: form.linkedin },
                { label: "Snapchat", url: form.snapchat },
              ]
                .filter((l) => l.url)
                .map((link) => (
                  <a
                    key={link.label}
                    href={link.label === "Email" ? `mailto:${link.url}` : link.url}
                    className="flex items-center justify-between px-3 py-2 rounded-lg border border-zinc-800 hover:border-emerald-400 bg-zinc-900/60"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>{link.label}</span>
                    <span className="text-xs text-zinc-400 break-all">{link.url}</span>
                  </a>
                ))}
            </div>
            {!["website", "instagram", "twitter", "linkedin", "snapchat", "email"].some(
              (k) => form[k]
            ) && (
              <p className="text-xs text-zinc-500">No links added yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
