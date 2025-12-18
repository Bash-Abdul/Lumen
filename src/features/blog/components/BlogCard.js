"use client";

import Link from "next/link";
import Avatar from "@/shared/ui/Avatar";

export default function BlogCard({ post }) {
  return (
    <Link href={`/learn/${post.slug}`} className="card overflow-hidden block">
      <div className="h-56 w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.cover}
          alt={post.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar src={post.author?.avatar} size={36} />
            <div>
              <p className="text-sm text-zinc-200">{post.author?.name}</p>
              <p className="text-xs text-zinc-500">{post.published}</p>
              <p className="text-xs text-zinc-500">{post.publishedAt}</p>
            </div>
          </div>
          <h3 className="text-lg font-semibold leading-tight">{post.title}</h3>
          <p className="text-sm text-zinc-300 line-clamp-2">{post.excerpt}</p>
          <div className="flex gap-2 flex-wrap">
            {post.tags?.map((tag) => (
              <span
                key={tag}
                className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
