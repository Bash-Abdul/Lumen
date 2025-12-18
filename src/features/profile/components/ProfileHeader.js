'use client';

import Button from "@/shared/ui/Button";
import Avatar from "@/shared/ui/Avatar";
import useAuth from "@/features/auth/hooks/useAuth";

export default function ProfileHeader({ profile }) {
  const { user } = useAuth();
  const isOwner = user?.username === profile?.username;

  return (
    <div className="card p-6 flex flex-col md:flex-row gap-6">
      <Avatar src={profile.avatar} size={96} />
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-semibold">{profile.name}</h1>
          <span className="text-zinc-400">@{profile.username}</span>
          {profile.location && (
            <span className="text-xs text-zinc-300 bg-zinc-900/70 px-3 py-1 rounded-full border border-zinc-800">
              {profile.location}
            </span>
          )}
          {isOwner && (
            <Button size="sm" variant="outline">
              Edit Profile
            </Button>
          )}
        </div>
        <p className="text-sm text-zinc-200 max-w-3xl">{profile.bio}</p>
        <div className="flex items-center gap-6 text-sm text-zinc-300">
          <span>
            <strong className="text-white">{profile.counters.photos}</strong>{" "}
            photos
          </span>
          <span>
            <strong className="text-white">{profile.counters.followers}</strong>{" "}
            followers
          </span>
          <span>
            <strong className="text-white">{profile.counters.following}</strong>{" "}
            following
          </span>
        </div>
        <div className="flex gap-3 flex-wrap">
          {profile.links?.map((link) => (
            <a
              key={link.url}
              href={link.url}
              className="text-sm text-emerald-300 hover:text-emerald-200 underline decoration-dotted"
              target="_blank"
              rel="noreferrer"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
