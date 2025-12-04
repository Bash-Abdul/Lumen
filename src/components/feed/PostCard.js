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
    <article className="card overflow-hidden">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.image}
          alt={post.caption}
          className="w-full h-[420px] object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 bg-zinc-950/60 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-zinc-200 border border-zinc-800">
          {post.tags?.slice(0, 2).join(" · ")}
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Avatar src={post.avatar} size={44} />
          <div>
            <p className="font-semibold">{post.photographerName}</p>
            <p className="text-sm text-zinc-400">@{post.username}</p>
          </div>
          {post.location && (
            <div className="ml-auto text-xs text-zinc-400 bg-zinc-900/60 px-3 py-1 rounded-full border border-zinc-800">
              {post.location}
            </div>
          )}
        </div>
        <p className="text-sm text-zinc-200">{post.caption}</p>
        <div className="flex items-center gap-3">
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
          <div className="ml-auto flex items-center gap-2 text-xs text-zinc-400">
            {post.camera && <span>{post.camera}</span>}
            {post.lens && <span>· {post.lens}</span>}
          </div>
        </div>
      </div>
    </article>
  );
}
