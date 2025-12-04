import ProfileHeader from "../../../components/profile/ProfileHeader";
import ProfileTabs from "../../../components/profile/ProfileTabs";
import { getProfile } from "../../../lib/api/profile";
import PostCard from "../../../components/feed/PostCard";
import BlogCard from "../../../components/blog/BlogCard";

function ImageGrid({ items = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <div key={item.id} className="card overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image}
            alt={item.caption}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
          <div className="p-3">
            <p className="text-sm text-zinc-300 line-clamp-2">
              {item.caption}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileContent({ profile }) {
  "use client";
  const { useState } = require("react");
  const [tab, setTab] = useState("photos");

  return (
    <div className="space-y-4">
      <ProfileTabs active={tab} onChange={setTab} />
      {tab === "photos" && <ImageGrid items={profile.posts} />}
      {tab === "reposts" && (
        <div className="grid gap-4">
          {profile.reposts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
      {tab === "blogs" && (
        <div className="grid md:grid-cols-2 gap-4">
          {profile.blogs.map((b) => (
            <BlogCard key={b.slug} post={b} />
          ))}
        </div>
      )}
    </div>
  );
}

export default async function ProfilePage({ params }) {
  const profile = await getProfile(params.username);
  if (!profile) {
    return (
      <div className="card p-6">
        <p className="text-sm text-zinc-300">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileHeader profile={profile} />
      <ProfileContent profile={profile} />
    </div>
  );
}
