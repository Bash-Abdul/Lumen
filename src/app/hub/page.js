'use client';

import { useEffect, useState } from "react";
import Button from "@/shared/ui/Button";
import HubHero from "@/features/hub/components/HubHero";
import CollectionCard from "@/features/hub/components/CollectionCard";
import { useAuths } from "@/features/auth/hooks/useAuthMock";
// import { createCollection, getHub } from "@/shared/lib/api/hub";

export default function HubPage() {
  const { users } = useAuths();
  const [hub, setHub] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    cover: "",
  });

  // useEffect(() => {
  //   if (!users?.username) return;
  //   setLoading(true);
  //   getHub(users.username)
  //     .then(setHub)
  //     .finally(() => setLoading(false));
  // }, [users]);

  const handleCreate = async (e) => {
    e.preventDefault();
    // const newCol = await createCollection(users.username, {
    //   ...form,
    //   featured: "New",
    // });
    // setHub((prev) => ({
    //   ...prev,
    //   collections: [newCol, ...(prev?.collections || [])],
    // }));
    // setForm({ title: "", description: "", cover: "" });
  };

  if (!users?.isCreator) {
    return (
      <div className="card p-8 space-y-4">
        <p className="text-sm text-zinc-300">Hub is for creators only.</p>
        <p className="text-sm text-zinc-400">
          Toggle Creator mode from the top bar to unlock your portfolio hub.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HubHero
        title="Creator Hub"
        tagline="Build a microsite with collections, featured galleries, and hire-me CTA."
        subtle="This view is private to you. Public visitors use /hub/[username]."
        cta={{ primaryLabel: "Preview public hub", secondaryLabel: "Share link" }}
      />

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Collections</h3>
            {loading && <p className="text-xs text-zinc-500">Loading hub...</p>}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {hub?.collections?.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        </div>

        <form onSubmit={handleCreate} className="card p-5 space-y-4">
          <div>
            <h4 className="text-lg font-semibold">New collection</h4>
            <p className="text-sm text-zinc-400">
              This will call POST /api/hub/collections later.
            </p>
          </div>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
            required
            className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
          />
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            placeholder="Description"
            rows={3}
            className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
          />
          <input
            value={form.cover}
            onChange={(e) => setForm({ ...form, cover: e.target.value })}
            placeholder="Cover image URL"
            className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
          />
          <Button type="submit">Add collection</Button>
        </form>
      </div>
    </div>
  );
}
