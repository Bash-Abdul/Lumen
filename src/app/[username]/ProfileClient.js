// app/[username]/ProfileClient.js
"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/shared/ui/Button";
import Avatar from "@/shared/ui/Avatar";
import ProfileTabs from "@/features/profile/components/ProfileTabs";
import FollowButton from "@/shared/ui/FollowButton";
import { updateProfile } from "@/server/actions/profileActions";

import EditProfileDrawer from "@/features/profile/components/EditProfileDrawer";
import ImageGrid from "@/features/profile/components/ImageGrid";
import LinksModal from "@/features/profile/components/LinksModal";
import StatsModal from "@/features/profile/components/StatsModal";

const TABS = [
  { key: "photos", label: "Recents" },
  { key: "reposts", label: "Reposts" },
  { key: "about", label: "About" },
];

function AboutSection({ profile }) {
  return (
    <div className="card p-6 space-y-4">
      {profile.bio && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-400 mb-2">About</h3>
          <p className="text-sm text-zinc-200">{profile.bio}</p>
        </div>
      )}

      {profile.location && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-400 mb-2">Location</h3>
          <p className="text-sm text-zinc-200">{profile.location}</p>
        </div>
      )}

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

      {profile.createdAt && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-400 mb-2">Joined</h3>
          <p className="text-sm text-zinc-200">
            {new Date(profile.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      )}
    </div>
  );
}

export default function ProfileClient({ initialProfile }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState({});

  const [profile, setProfile] = useState(initialProfile);

  useEffect(() => {
    setProfile({
      ...initialProfile,
      posts: initialProfile.posts ?? [],
      reposts: initialProfile.reposts ?? [],
      links: initialProfile.links ?? [],
    });
  }, [initialProfile]);

  const [tab, setTab] = useState("photos");
  const [showStats, setShowStats] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const isOwnProfile = profile.viewer?.isOwnProfile;

  const stats = useMemo(() => {
    if (profile.counters) {
      return {
        photos: profile.counters.photos || 0,
        reposts: profile.counters.reposts || 0,
        likes: profile.counters.likes || 0,
        repostsCount: profile.counters.repostsReceived || 0,
        followers: profile.counters.followers || 0,
        following: profile.counters.following || 0,
      };
    }

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

  const handleSaveProfile = async (form) => {
    setErrors({});

    const formData = new FormData();
    formData.append("displayName", form.displayName);
    formData.append("username", form.username);
    formData.append("bio", form.bio);
    formData.append("avatarUrl", form.avatar);
    formData.append("website", form.website);

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
        setShowEdit(false);
        router.refresh();
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
            {isOwnProfile && (
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
                Profile
              </p>
            )}
            <h1 className="text-3xl font-semibold">{profile.name}</h1>
            <p className="text-sm text-zinc-400">@{profile.username}</p>
            {profile.bio && <p className="text-lg text-white mt-1">{profile.bio}</p>}
          </div>
        </div>

        <div className="flex gap-2">
          {isOwnProfile ? (
            <>
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
                        router.push("/upload");
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
              <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
                Edit profile
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setShowStats(true)}>
                Statistics
              </Button>
            </>
          ) : (
            <>
              <FollowButton
                targetUserId={profile.userId}
                initialFollowing={profile.viewer?.isFollowing || false}
                initialFollowerCount={stats.followers}
                isAuthenticated={profile.viewer?.isAuthenticated || false}
                size="sm"
              />
              <Button variant="outline" size="sm">
                Message
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Quick link pills - only for own profile */}
      {isOwnProfile && profile.links.length > 0 && (
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
            {profile.links.slice(0, 3).map((link) => (
              <span
                key={link.label}
                className="px-2 py-1 rounded-full border border-zinc-800 bg-zinc-900/60"
              >
                {link.label.toLowerCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-6 pt-2">
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

      {/* Tabs */}
      <div className="flex items-center justify-between mt-6">
        <ProfileTabs active={tab} onChange={setTab} tabs={TABS} />
        {tab === "photos" && (
          <div className="text-sm text-zinc-400">{profile.posts.length} photos</div>
        )}
        {tab === "reposts" && (
          <div className="text-sm text-zinc-400">{profile.reposts.length} reposts</div>
        )}
      </div>

      {/* Content */}
      {tab === "photos" && (
        <>
          {!profile.posts || profile.posts.length === 0 ? (
            <div className="flex items-center justify-between border border-dashed border-zinc-800 rounded-xl p-4 bg-zinc-950/50">
              <p className="text-sm text-zinc-400">No posts yet.</p>
              {isOwnProfile && (
                <Button variant="secondary" size="sm" onClick={() => router.push("/upload")}>
                  Upload photo
                </Button>
              )}
            </div>
          ) : (
            <ImageGrid items={profile.posts} username={profile.username} />
          )}
        </>
      )}

      {tab === "reposts" && (
        <>
          {!profile.reposts || profile.reposts.length === 0 ? (
            <div className="flex items-center justify-between border border-dashed border-zinc-800 rounded-xl p-4 bg-zinc-950/50">
              <p className="text-sm text-zinc-400">No reposts yet.</p>
            </div>
          ) : (
            <ImageGrid items={profile.reposts ?? []} username={profile.username} />
          )}
        </>
      )}

      {tab === "about" && <AboutSection profile={profile} />}

      {/* Modals / drawers - only for own profile */}
      {isOwnProfile && (
        <>
          <StatsModal open={showStats} onClose={() => setShowStats(false)} stats={stats} />
          <LinksModal open={showLinks} onClose={() => setShowLinks(false)} links={profile.links} />
          <EditProfileDrawer
            open={showEdit}
            onClose={() => setShowEdit(false)}
            profile={profile}
            onSave={handleSaveProfile}
            isPending={isPending}
            errors={errors}
          />
        </>
      )}
    </div>
  );
}