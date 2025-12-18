// app/u/[username]/not-found.js
import Link from "next/link";
import Button from "@/shared/ui/Button";

export default function NotFound() {
  return (
    <div className="card p-12 text-center space-y-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-lg text-zinc-300">User not found</p>
      <p className="text-sm text-zinc-500">
        This user doesn't exist or has been removed.
      </p>
      <Button href="/search" variant="primary">
        Explore users
      </Button>
    </div>
  );
}
