'use client';

import { useState } from "react";
import Button from "../../../components/common/Button";
import { useBlogs } from "../../../lib/hooks/useBlogs";
import { useAuths } from "../../../lib/hooks/useAuthMock";

export default function CreateBlogPage() {
  const { addBlog } = useBlogs();
  const { users } = useAuths();
  const [title, setTitle] = useState("");
  const [cover, setCover] = useState("");
  const [tags, setTags] = useState("workflow, lighting");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Saving...");
    await addBlog({
      title,
      cover,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      content,
      author: { name: users?.name, avatar: users?.avatar },
    });
    setStatus("Saved (mock). This would POST to /api/blogs.");
    setTitle("");
    setCover("");
    setContent("");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
          Write
        </p>
        <h1 className="text-3xl font-semibold">Create blog post</h1>
        <p className="text-sm text-zinc-400">
          Draft a simple story. This uses the mock API and local state for now.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
        />
        <input
          value={cover}
          onChange={(e) => setCover(e.target.value)}
          placeholder="Cover image URL (optional)"
          className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
        />
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags separated by commas"
          className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your story..."
          rows={8}
          required
          className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
        />
        <Button type="submit" disabled={!title || !content}>
          Publish (mock)
        </Button>
        {status && <p className="text-xs text-zinc-400">{status}</p>}
      </form>
    </div>
  );
}
