'use client';

import { useState } from "react";
import Avatar from "../common/Avatar";
import Button from "../common/Button";

export default function PostCard({ post }) {
  const [likes, setLikes] = useState(post.likes);
  const [reposts, setReposts] = useState(post.reposts);
  const [liked, setLiked] = useState(post.liked);
  const [reposted, setReposted] = useState(post.reposted);

  const toggleLike = () => {
    setLiked((prev) => !prev);
    setLikes((prev) => prev + (liked ? -1 : 1));
  };

  const toggleRepost = () => {
    setReposted((prev) => !prev);
    setReposts((prev) => prev + (reposted ? -1 : 1));
  };

  return (
    <article className="relative overflow-hidden border border-zinc-800 bg-zinc-950/60 group break-inside-avoid">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={post.image}
        alt={post.caption}
        className="w-full h-auto object-cover block"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <div className="absolute inset-0 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-4">
        <div className="flex items-center gap-2">
          {post.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar src={post.avatar} size={40} />
            <div>
              <p className="font-semibold text-white">{post.photographerName}</p>
              <p className="text-xs text-zinc-300">@{post.username}</p>
            </div>
          </div>
          <p className="text-sm text-zinc-200 line-clamp-2">{post.caption}</p>
          <div className="flex items-center gap-2">
            <Button
              variant={liked ? "primary" : "secondary"}
              size="sm"
              onClick={toggleLike}
            >
              ♥ {likes}
            </Button>
            <Button
              variant={reposted ? "primary" : "secondary"}
              size="sm"
              onClick={toggleRepost}
            >
              ↻ {reposts}
            </Button>
            <div className="ml-auto flex items-center gap-2 text-xs text-zinc-200">
              {post.location && <span>{post.location}</span>}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
