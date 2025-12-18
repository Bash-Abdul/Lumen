// app/u/[username]/PublicProfileClient.js
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Button from "@/components/common/Button";
import Avatar from "@/components/common/Avatar";
import ProfileTabs from "@/components/profile/ProfileTabs";
import FollowButton from "@/components/common/FollowButton";

const TABS = [
  { key: "photos", label: "Photos" },
  { key: "about", label: "About" },
];

function ImageGrid({ items = [] }) {
  if (items.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-zinc-400">No photos yet</p>
      </div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
      {items.map((item) => (
        <div key={item.id} className="break-inside-avoid">
          <img
            src={item.image}
            alt={item.caption}
            className="w-full h-auto object-cover block rounded-lg"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}

function AboutSection({ profile }) {
  return (
    <div className="card p-6 space-y-4">
      {/* Bio */}
      {profile.bio && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-400 mb-2">About</h3>
          <p className="text-sm text-zinc-200">{profile.bio}</p>
        </div>
      )}

      {/* Location */}
      {profile.location && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-400 mb-2">Location</h3>
          <p className="text-sm text-zinc-200">{profile.location}</p>
        </div>
      )}

      {/* Links */}
      {profile.links.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-400 mb-2">Links</h3>
          <div className="space-y-2">
            {profile.links.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300"
              >
                <span>{link.label}</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Joined Date */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-400 mb-2">Joined</h3>
        <p className="text-sm text-zinc-200">
          {new Date(profile.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}

export default function PublicProfileClient({ profile, isOwnProfile }) {
  const [tab, setTab] = useState("photos");

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar src={profile.avatar} size={80} />
            <div>
              <h1 className="text-2xl font-semibold">{profile.name}</h1>
              <p className="text-sm text-zinc-400">@{profile.username}</p>
              {profile.location && (
                <p className="text-sm text-zinc-500 mt-1">
                  📍 {profile.location}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {profile.viewer?.isOwnProfile ? (
              <Button href="/profile" variant="outline" size="sm">
                Edit Profile
              </Button>
            ) : (
              <>
                  {/* <FollowButton
                  targetUserId={profile.userId}
                  initialFollowing={profile.viewer?.isFollowing || false}
                  initialFollowerCount={stats.followers}
                  isAuthenticated={profile.viewer?.isAuthenticated || false}
                  size="sm"
                /> */}
                <Button variant="outline" size="sm">
                  Follow
                </Button>
                <Button variant="outline" size="sm">
                  Message
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-zinc-300 mt-4 max-w-2xl">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-zinc-800">
          <div>
            <p className="text-lg font-semibold">{stats.photos}</p>
            <p className="text-xs text-zinc-500">Photos</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{stats.followers}</p>
            <p className="text-xs text-zinc-500">Followers</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{stats.following}</p>
            <p className="text-xs text-zinc-500">Following</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <ProfileTabs active={tab} onChange={setTab} tabs={TABS} />
      </div>

      {/* Content */}
      <div className="mt-6">
        {tab === "photos" && <ImageGrid items={profile.posts} />}
        {tab === "about" && <AboutSection profile={profile} />}
      </div>
    </div>
  );
}