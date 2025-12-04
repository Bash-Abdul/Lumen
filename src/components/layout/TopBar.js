'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Avatar from "../common/Avatar";
import Button from "../common/Button";
import { useAuths } from "../../lib/hooks/useAuthMock";

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { users, setUser } = useAuths();
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const toggleCreator = () => {
    setUser((prev) => ({ ...prev, isCreator: !prev?.isCreator }));
  };

  return (
    <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 gap-4">
        <div className="hidden md:flex items-center gap-3 text-sm text-zinc-400">
          <span className="text-xs uppercase tracking-[0.2em] text-emerald-300">
            {pathname === "/" ? "Home" : pathname.replace("/", "") || "Home"}
          </span>
          <div className="w-1 h-1 rounded-full bg-zinc-700" />
          <span>Photography · Stories · Hub</span>
        </div>

        <form
          onSubmit={handleSearch}
          className="flex-1 flex max-w-xl items-center gap-3 bg-zinc-900/70 border border-zinc-800 rounded-full px-4 py-2"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-zinc-100"
            placeholder="Search people, photos, or blogs"
          />
          <button
            type="submit"
            className="text-sm text-emerald-300 hover:text-emerald-200"
          >
            ⌕
          </button>
        </form>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleCreator}
            className="hidden sm:inline-flex"
          >
            {users?.isCreator ? "Creator On" : "Creator Off"}
          </Button>
          <Link href={`/u/${users?.username || "you"}`}>
            <div className="flex items-center gap-2">
              <Avatar src={users?.avatar} size={40} />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-white">
                  {users?.name || "Guest"}
                </p>
                <p className="text-xs text-zinc-400">
                  @{users?.username || "anon"}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
