"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import Button from "@/shared/ui/Button";
import { toggleFollow } from "@/server/actions/followActions";

export default function FollowButton({
  targetUserId,
  initialFollowing = false,
  initialFollowerCount = 0,
  isAuthenticated = false,
  size = "sm",
}) {
  const [isPending, startTransition] = useTransition();
  const [following, setFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);

  const onClick = () => {
    if (!isAuthenticated) {
      toast.error("Sign in to follow people");
      return;
    }

    if (!targetUserId) {
      toast.error("Missing userId for follow, check your data shape");
      return;
    }

    const next = !following;

    // optimistic
    setFollowing(next);
    setFollowerCount((prev) => prev + (next ? 1 : -1));

    startTransition(async () => {
      const res = await toggleFollow(targetUserId);

      if (res?.error) {
        // revert
        setFollowing(!next);
        setFollowerCount((prev) => prev + (next ? -1 : 1));
        toast.error(res.error);
        return;
      }

      setFollowing(res.following);
      setFollowerCount(res.followerCount);
      toast.success(res.following ? "Following" : "Unfollowed");
    });
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={following ? "secondary" : "primary"}
        size={size}
        onClick={onClick}
        disabled={isPending}
      >
        {isPending ? "..." : following ? "Following" : "Follow"}
      </Button>

      <span className="text-xs text-zinc-400">
        {followerCount} follower{followerCount === 1 ? "" : "s"}
      </span>
    </div>
  );
}
