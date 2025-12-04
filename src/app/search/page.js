'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Tabs from "../../components/common/Tabs";
import Avatar from "../../components/common/Avatar";
import Button from "../../components/common/Button";
import BlogCard from "../../components/blog/BlogCard";
import { useSearch } from "../../lib/hooks/useSearch";

const SEARCH_TABS = [
  { key: "people", label: "People" },
  { key: "images", label: "Images" },
  { key: "blogs", label: "Blogs" },
];

function PersonCard({ user }) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <Avatar src={user.avatar} size={52} />
      <div className="flex-1">
        <p className="font-semibold">{user.name}</p>
        <p className="text-sm text-zinc-400">@{user.username}</p>
        <p className="text-xs text-zinc-500">{user.bio}</p>
      </div>
      <Button size="sm" variant="secondary">
        Follow
      </Button>
    </div>
  );
}

function ImageGrid({ images }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((img) => (
        <div key={img.id} className="card overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.image}
            alt={img.caption}
            className="w-full h-52 object-cover"
            loading="lazy"
          />
          <div className="p-3 flex items-center justify-between text-sm text-zinc-300">
            <span>@{img.username}</span>
            <span>♥ {img.likes}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SearchPage() {
  const [tab, setTab] = useState("people");
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") || "";
  const { query, setQuery, results, loading } = useSearch(initial);

  useEffect(() => {
    if (initial) setQuery(initial);
  }, [initial, setQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">Search</h1>
        <p className="text-sm text-zinc-400">
          Find photographers, images, and blog posts.
        </p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, tag, or title..."
          className="w-full rounded-2xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
        />
        <div className="flex items-center gap-3">
          <Tabs tabs={SEARCH_TABS} activeKey={tab} onChange={setTab} />
          {loading && <span className="text-sm text-zinc-500">Searching...</span>}
        </div>
      </div>

      {tab === "people" && (
        <div className="grid md:grid-cols-2 gap-4">
          {results.people.map((user) => (
            <PersonCard key={user.id} user={user} />
          ))}
        </div>
      )}
      {tab === "images" && <ImageGrid images={results.images} />}
      {tab === "blogs" && (
        <div className="grid md:grid-cols-2 gap-4">
          {results.blogs.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      {!loading &&
        query &&
        results.people.length === 0 &&
        results.images.length === 0 &&
        results.blogs.length === 0 && (
          <p className="text-sm text-zinc-400">No results yet. Try another query.</p>
        )}
    </div>
  );
}
