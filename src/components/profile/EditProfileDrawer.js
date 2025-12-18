"use client"

import { useState } from "react";
import Button from "@/components/common/Button";
import Avatar from "@/components/common/Avatar";
 
 export default function EditProfileDrawer({
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