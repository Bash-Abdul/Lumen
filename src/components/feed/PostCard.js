'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Avatar from "../common/Avatar";
import Button from "../common/Button";
import { toast } from "sonner";
import { likePost, repostPost } from "@/lib/actions (for mutations only, server actions)/postActions";

export default function PostCard({ post }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();


  const [likes, setLikes] = useState(post.likes);
  const [reposts, setReposts] = useState(post.reposts);
  const [liked, setLiked] = useState(post.liked);
  const [reposted, setReposted] = useState(post.reposted);

  // const toggleLike = () => {
  //   setLiked((prev) => !prev);
  //   setLikes((prev) => prev + (liked ? -1 : 1));
  // };

  // const toggleRepost = () => {
  //   setReposted((prev) => !prev);
  //   setReposts((prev) => prev + (reposted ? -1 : 1));
  // };

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes((prev) => prev + (newLiked ? 1 : -1));

    startTransition(async () => {
      const result = await likePost(post.id);

      if (result?.error) {
        setLiked(!newLiked);
        setLikes((prev) => prev + (newLiked ? -1 : 1));
        toast.error(result.error);
        return;
      }

      if (result?.success) {
        setLiked(result.liked);
        setLikes(result.likeCount);
      }
    });
  };

  const handleRepost = () => {
    const newReposted = !reposted;
    setReposted(newReposted);
    setReposts((prev) => prev + (newReposted ? 1 : -1));

    startTransition(async () => {
      const result = await repostPost(post.id);

      if (result?.error) {
        setReposted(!newReposted);
        setReposts((prev) => prev + (newReposted ? -1 : 1));
        toast.error(result.error);
        return;
      }

      if (result?.success) {
        setReposted(result.reposted);
        setReposts(result.repostCount);
        toast.success(newReposted ? "Reposted!" : "Repost removed");
      }
    });
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    router.push(`/profile/${post.username}`);
  };

  const handlePostClick = () => {
    router.push(`/post/${post.id}`);
  };


  return (
    <article className="relative overflow-hidden border border-zinc-800 bg-zinc-950/60 group break-inside-avoid">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={post.thumbUrl || post.image}
        alt={post.caption || "Photo"}
        className="w-full h-auto object-cover block"
        loading="lazy"
        onClick={handlePostClick}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

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
          <div className="flex items-center gap-3" onClick={handleProfileClick}>
            <Avatar src={post.avatar} size={40} />
            <div>
              <p className="font-semibold text-white">{post.photographerName}</p>
              <p className="text-xs text-zinc-300">@{post.username}</p>
            </div>
          </div>
          {post.caption && (
            <p className="text-sm text-zinc-200 line-clamp-2">{post.caption}</p>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant={liked ? "primary" : "secondary"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              disabled={isPending}
            >
              ♥ {likes}
            </Button>
            <Button
              variant={reposted ? "primary" : "secondary"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRepost();
              }}
              disabled={isPending}
            >
              ↻ {reposts}
            </Button>

            {/* <div className="ml-auto flex items-center gap-2 text-xs text-zinc-200">
              {post.location && <span>{post.location}</span>}
            </div> */}

            {post.location && (
              <div className="ml-auto flex items-center gap-2 text-xs text-zinc-200">
                <span>{post.location}</span>
              </div>
            )}

          </div>
        </div>
      </div>
    </article>
  );
}
