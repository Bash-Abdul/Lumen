// app/profile/ProfileClient.js
"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/components/common/Button";
import Avatar from "@/components/common/Avatar";
import ProfileTabs from "@/components/profile/ProfileTabs";
import FollowButton from "@/components/common/FollowButton";
// import { updateProfile } from "@/actions/profile";
import { updateProfile } from "@/lib/actions (for mutations only, server actions)/profileActions";
// import UploadModal from "@/components/feed/UploadModal";

import EditProfileDrawer from "@/components/profile/EditProfileDrawer";
import ImageGrid from "@/components/profile/ImageGrid";
import LinksModal from "@/components/profile/LinksModal";
import StatsModal from "@/components/profile/StatsModal";
import Stat from "@/components/profile/Stat";

const TABS = [
  { key: "photos", label: "Recents" },
  { key: "reposts", label: "Reposts" },
];

// ─────────────────────────────────────────────
// Main client component
// ─────────────────────────────────────────────

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
  // const [showUpload, setShowUpload] = useState(false);

  const stats = useMemo(() => {

    // Use counters from server if available
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



  // const handleAddPost = ({ previewUrl, caption, tags }) => {
  //   setProfile((prev) => ({
  //     ...prev,
  //     posts: [
  //       {
  //         id: `temp-${Date.now()}`,
  //         image: previewUrl,
  //         caption: caption || "New upload",
  //         tags: tags || [],
  //         likes: 0,
  //         reposts: 0,
  //         username: prev.username,
  //         photographerName: prev.name,
  //         avatar: prev.avatar,
  //       },
  //       ...(prev.posts || []),
  //     ],
  //     counters: {
  //       ...prev.counters,
  //       photos: (prev.counters?.photos || 0) + 1,
  //     },
  //   }));
  //   toast.success("Uploaded (mock). Wire to real upload endpoint.");
  //   setShowUpload(false);
  //   setShowCreate(false);
  // };

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
                    router.push('/upload')
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
          {!profile.posts || profile.posts.length === 0 ? (
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
                        router.push('/upload')
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

      {/* {tab === "reposts" && <ImageGrid items={profile.reposts} />} */}

      {tab === "reposts" && (
        <>
          {/* {(profile.reposts ?? []).length === 0 ? ( */}
          {!profile.reposts || profile.reposts.length === 0 ? (
            <div className="flex items-center justify-between border border-dashed border-zinc-800 rounded-xl p-4 bg-zinc-950/50">
              <p className="text-sm text-zinc-400">No reposts yet.</p>
            </div>
          ) : (
            <ImageGrid items={profile.reposts ?? []} />
          )}
        </>
      )}

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
