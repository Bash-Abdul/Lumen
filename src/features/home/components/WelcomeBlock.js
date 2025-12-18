"use client";

import Link from "next/link";
import Button from "@/shared/ui/Button";
// import { useAuth } from "../../@/features/auth/hooks/useAuthMock";

export default function WelcomeBlock({ checkUser }) {
  // const { user } = useAuth();
  // if (!user) return null;
  const user = checkUser;

  return (
    <div className="card p-6 flex items-center justify-between">
      <div>
        {!user ? (
          <h3 className="text-sm text-emerald-300">Welcome to Lumen</h3>
        ) : (
          <>
            <p className="text-sm text-emerald-300">Welcome back</p>
            <h3 className="text-xl font-semibold mt-1">{user?.name || user?.email}</h3>
          </>
        )}
        <p className="text-sm text-zinc-400">
          Jump into your feed or update your hub.
        </p>
      </div>
      {
        !user ? (
          <Button href={'/login'} size="sm">Login to access feed</Button>
        ) : (
          <div className="flex gap-2">
        <Button href="/feed" size="sm">
          Open Feed
        </Button>
        <Button href="/hub" variant="outline" size="sm">
          Your Hub
        </Button>
      </div>
        )
      }
    </div>
  );
}
