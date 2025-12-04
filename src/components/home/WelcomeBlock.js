'use client';

import Link from "next/link";
import Button from "../common/Button";
import { useAuth } from "../../lib/hooks/useAuthMock";

export default function WelcomeBlock() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="card p-6 flex items-center justify-between">
      <div>
        <p className="text-sm text-emerald-300">Welcome back</p>
        <h3 className="text-xl font-semibold mt-1">{user.name}</h3>
        <p className="text-sm text-zinc-400">
          Jump into your feed or update your hub.
        </p>
      </div>
      <div className="flex gap-2">
        <Button href="/feed" size="sm">
          Open Feed
        </Button>
        <Button href="/hub" variant="outline" size="sm">
          Your Hub
        </Button>
      </div>
    </div>
  );
}
