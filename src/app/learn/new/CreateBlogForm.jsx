// app/learn/new/CreateBlogForm.js
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "@/lib/actions (for mutations only, server actions)/blogActions";
import Button from "@/components/common/Button";
import { toast } from "sonner"; // optional

export default function CreateBlogForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    coverUrl: "",
    tags: "",
    content: "",
    publish: false,
  });

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formDataObj = new FormData();
    formDataObj.append("title", formData.title);
    formDataObj.append("content", formData.content);
    formDataObj.append("coverUrl", formData.coverUrl);
    formDataObj.append("tags", formData.tags);
    formDataObj.append("status", formData.publish ? "PUBLISHED" : "DRAFT");

    startTransition(async () => {
      const result = await createPost(formDataObj);

      if (result?.error) {
        setError(result.error);
        toast?.error(result.error);
      } else {
        toast?.success(
          formData.publish ? "Post published!" : "Draft saved!"
        );
        router.push(`/learn/${result.slug}`);
      }
    });
  };

  const togglePublish = () => {
    setFormData((prev) => ({ ...prev, publish: !prev.publish }));
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <input
        value={formData.title}
        onChange={handleChange("title")}
        placeholder="Title"
        required
        disabled={isPending}
        className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400 disabled:opacity-50"
      />

      <input
        value={formData.coverUrl}
        onChange={handleChange("coverUrl")}
        placeholder="Cover image URL (optional)"
        disabled={isPending}
        className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400 disabled:opacity-50"
      />

      <input
        value={formData.tags}
        onChange={handleChange("tags")}
        placeholder="Tags separated by commas (e.g. workflow, lighting)"
        disabled={isPending}
        className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400 disabled:opacity-50"
      />

      <textarea
        value={formData.content}
        onChange={handleChange("content")}
        placeholder="Write your story..."
        rows={8}
        required
        disabled={isPending}
        className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400 disabled:opacity-50"
      />

      <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
        <div>
          <p className="text-sm text-zinc-200">Publish toggle</p>
          <p className="text-xs text-zinc-500">
            Off = save as draft, On = publish immediately.
          </p>
        </div>
        <button
          type="button"
          onClick={togglePublish}
          disabled={isPending}
          className={[
            "relative flex items-center w-16 h-8 rounded-full transition-colors duration-200 border",
            formData.publish
              ? "bg-emerald-500/30 border-emerald-400"
              : "bg-zinc-800 border-zinc-700",
            isPending && "opacity-50 cursor-not-allowed",
          ].join(" ")}
        >
          <span
            className={[
              "absolute left-1 bottom-1 h-6 w-6 rounded-full bg-white transition-transform duration-200",
              formData.publish ? "translate-x-8" : "translate-x-0",
            ].join(" ")}
          />
        </button>
      </div>

      <Button type="submit" disabled={!formData.title || !formData.content || isPending}>
        {isPending
          ? "Saving..."
          : formData.publish
          ? "Publish"
          : "Save draft"}
      </Button>

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </form>
  );
}