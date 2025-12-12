// app/profile/ProfileClient.js
"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/components/common/Button";
import Avatar from "@/components/common/Avatar";
import ProfileTabs from "@/components/profile/ProfileTabs";
// import { updateProfile } from "@/actions/profile";
import { updateProfile } from "@/lib/actions (for mutations only, server actions)/profileActions";

const TABS = [
  { key: "photos", label: "Recents" },
  { key: "reposts", label: "Reposts" },
];

// ─────────────────────────────────────────────
// Small presentational bits
// ─────────────────────────────────────────────

function ImageGrid({ items = [] }) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
      {items.map((item) => (
        <div key={item.id} className="break-inside-avoid">
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

// ─────────────────────────────────────────────
// Modals / drawers
// ─────────────────────────────────────────────

function StatsModal({ open, onClose, stats }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="card p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Profile stats</h3>
          <button
            onClick={onClose}
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
  );
}

function LinksModal({ open, onClose, links }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="card p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Links & socials</h3>
          <button
            onClick={onClose}
            className="text-sm text-zinc-400 hover:text-white"
          >
            Close
          </button>
        </div>

        {links.length > 0 ? (
          <div className="space-y-3 text-sm">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.label === "Email" ? `mailto:${link.url}` : link.url}
                className="flex items-center justify-between px-3 py-2 rounded-lg border border-zinc-800 hover:border-emerald-400 bg-zinc-900/60"
                target="_blank"
                rel="noreferrer"
              >
                <span>{link.label}</span>
                <span className="text-xs text-zinc-400 break-all">
                  {link.url}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500">No links added yet.</p>
        )}
      </div>
    </div>
  );
}

function EditProfileDrawer({
  open,
  onClose,
  profile,
  onSave,
  isPending,
  errors,
}) {
  const [form, setForm] = useState({
    avatar: profile.avatar || "",
    displayName: profile.name || "",
    username: profile.username || "",
    bio: profile.bio || "",
    website: profile.website || "",
    email: profile.email || "",
    instagram: profile.socials?.instagram || "",
    twitter: profile.socials?.twitter || "",
    linkedin: profile.socials?.linkedin || "",
    snapchat: profile.socials?.snapchat || "",
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit profile</h3>
          <button
            onClick={onClose}
            className="text-sm text-zinc-400 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="space-y-4">
          {/* Avatar */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Avatar src={form.avatar || profile.avatar} size={64} />
              <input
                value={form.avatar}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, avatar: e.target.value }))
                }
                placeholder="Avatar URL"
                disabled={isPending}
                className={`w-full rounded-xl bg-zinc-900/80 border px-3 py-2 text-sm text-zinc-100 focus:outline-none disabled:opacity-50 ${
                  errors.avatarUrl
                    ? "border-red-500 focus:border-red-400"
                    : "border-zinc-800 focus:border-emerald-400"
                }`}
              />
            </div>
            {errors.avatarUrl && (
              <p className="text-xs text-red-400">{errors.avatarUrl}</p>
            )}
          </div>

          {/* Display Name */}
          <div>
            <input
              value={form.displayName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, displayName: e.target.value }))
              }
              placeholder="Display name"
              disabled={isPending}
              className={`w-full rounded-xl bg-zinc-900/80 border px-3 py-2 text-sm text-zinc-100 focus:outline-none disabled:opacity-50 ${
                errors.displayName
                  ? "border-red-500 focus:border-red-400"
                  : "border-zinc-800 focus:border-emerald-400"
              }`}
            />
            {errors.displayName && (
              <p className="text-xs text-red-400 mt-1">{errors.displayName}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <input
              value={form.username}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, username: e.target.value }))
              }
              placeholder="Username"
              disabled={isPending}
              className={`w-full rounded-xl bg-zinc-900/80 border px-3 py-2 text-sm text-zinc-100 focus:outline-none disabled:opacity-50 ${
                errors.username
                  ? "border-red-500 focus:border-red-400"
                  : "border-zinc-800 focus:border-emerald-400"
              }`}
            />
            {errors.username && (
              <p className="text-xs text-red-400 mt-1">{errors.username}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <textarea
              value={form.bio}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bio: e.target.value }))
              }
              placeholder="About / description"
              rows={3}
              disabled={isPending}
              className={`w-full rounded-xl bg-zinc-900/80 border px-3 py-2 text-sm text-zinc-100 focus:outline-none disabled:opacity-50 ${
                errors.bio
                  ? "border-red-500 focus:border-red-400"
                  : "border-zinc-800 focus:border-emerald-400"
              }`}
            />
            {errors.bio && (
              <p className="text-xs text-red-400 mt-1">{errors.bio}</p>
            )}
          </div>

          {/* Website */}
          <div>
            <input
              value={form.website}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, website: e.target.value }))
              }
              placeholder="Website / portfolio URL"
              disabled={isPending}
              className={`w-full rounded-xl bg-zinc-900/80 border px-3 py-2 text-sm text-zinc-100 focus:outline-none disabled:opacity-50 ${
                errors.website
                  ? "border-red-500 focus:border-red-400"
                  : "border-zinc-800 focus:border-emerald-400"
              }`}
            />
            {errors.website && (
              <p className="text-xs text-red-400 mt-1">{errors.website}</p>
            )}
          </div>

          {/* Email (read-only) */}
          <input
            value={form.email}
            placeholder="Email"
            type="email"
            disabled
            className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-3 py-2 text-sm text-zinc-400 opacity-60"
          />

          {/* Socials */}
          <div className="grid grid-cols-2 gap-3">
            <input
              value={form.instagram}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, instagram: e.target.value }))
              }
              placeholder="Instagram URL"
              disabled={isPending}
              className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400 disabled:opacity-50"
            />
            <input
              value={form.twitter}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, twitter: e.target.value }))
              }
              placeholder="Twitter / X URL"
              disabled={isPending}
              className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400 disabled:opacity-50"
            />
            <input
              value={form.linkedin}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, linkedin: e.target.value }))
              }
              placeholder="LinkedIn URL"
              disabled={isPending}
              className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400 disabled:opacity-50"
            />
            <input
              value={form.snapchat}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, snapchat: e.target.value }))
              }
              placeholder="Snapchat URL"
              disabled={isPending}
              className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400 disabled:opacity-50"
            />
          </div>

          <Button onClick={() => onSave(form)} disabled={isPending}>
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main client component
// ─────────────────────────────────────────────

export default function ProfileClient({ initialProfile }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState({});

//   const [profile, setProfile] = useState(initialProfile);
const profile = initialProfile;
  const [tab, setTab] = useState("photos");
  const [showStats, setShowStats] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const stats = useMemo(() => {
    const likes = profile.posts?.reduce((sum, p) => sum + (p.likes || 0), 0);
    const reposts = profile.posts?.reduce(
      (sum, p) => sum + (p.reposts || 0),
      0
    );
    return {
      photos: profile.posts?.length || 0,
      reposts: profile.reposts?.length || 0,
      likes,
      repostsCount: reposts,
      followers: profile.counters?.followers || 0,
      following: profile.counters?.following || 0,
    };
  }, [profile]);



  const handleSaveProfile = async (form) => {
    setErrors({});

    const formData = new FormData();
    formData.append("displayName", form.displayName);
    formData.append("username", form.username);
    formData.append("bio", form.bio);
    formData.append("avatarUrl", form.avatar);
    formData.append("website", form.website);

    // Build socials object
    const socials = {};
    if (form.instagram) socials.instagram = form.instagram;
    if (form.twitter) socials.twitter = form.twitter;
    if (form.linkedin) socials.linkedin = form.linkedin;
    if (form.snapchat) socials.snapchat = form.snapchat;

    formData.append("socials", JSON.stringify(socials));

    startTransition(async () => {
      const result = await updateProfile(formData);

      if (result?.error) {
        if (result.field) {
          setErrors({ [result.field]: result.error });
        } else {
          setErrors({ general: result.error });
        }
        toast.error(result.error);
      } else {
        toast.success("Profile updated!");
        // router.refresh(); 
        setShowEdit(false);
        // router.push('/profile')
        router.refresh(); // Refresh server data
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar src={profile.avatar} size={72} />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
              Profile
            </p>
            <h1 className="text-3xl font-semibold">{profile.name}</h1>
            <p className="text-sm text-zinc-400">@{profile.username}</p>
            <p className="text-lg text-white">{profile.bio}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEdit(true)}
          >
            Edit profile
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowStats(true)}
          >
            Statistics
          </Button>
        </div>
      </div>

      {/* Quick link pills */}
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
          {profile.links
            .slice(0, 3)
            .map((link) => (
              <span
                key={link.label}
                className="px-2 py-1 rounded-full border border-zinc-800 bg-zinc-900/60"
              >
                {link.label.toLowerCase()}
              </span>
            ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between mt-6">
        <ProfileTabs active={tab} onChange={setTab} tabs={TABS} />
        <div className="text-sm text-zinc-400">
          {tab === "photos"
            ? `${profile.posts.length} photos`
            : `${profile.reposts.length} reposts`}
        </div>
      </div>

      {/* Content */}
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

      {/* Modals / drawers */}
      <StatsModal
        open={showStats}
        onClose={() => setShowStats(false)}
        stats={stats}
      />

      <LinksModal
        open={showLinks}
        onClose={() => setShowLinks(false)}
        links={profile.links}
      />

      <EditProfileDrawer
        open={showEdit}
        onClose={() => setShowEdit(false)}
        profile={profile}
        onSave={handleSaveProfile}
        isPending={isPending}
        errors={errors}
      />
    </div>
  );
}