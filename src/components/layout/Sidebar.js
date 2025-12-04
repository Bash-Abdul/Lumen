'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "../common/Button";
import { useAuth } from "../../lib/hooks/useAuthMock";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Feed", href: "/feed" },
  { label: "Search", href: "/search" },
  { label: 'Profile', href: '/profile'},
  { label: "Learn", href: "/learn" },
  { label: "Hub", href: "/hub", requiresCreator: true },
  { label: "Account", href: "/account" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-5 py-6 gap-6 sticky top-0 h-screen">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-black font-semibold">
          L
        </div>
        <div>
          <p className="text-lg font-semibold">Lumen</p>
          <p className="text-xs text-zinc-400">Photography playground</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems
        .filter((item) => !item.requiresCreator || user?.isCreator)
        .map((item) => {

          //  if (item.label === "Hub" && !user?.isCreator) return null; 


          const isActive =
            item.href === "/"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200",
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-300 hover:bg-zinc-900",
              ].join(" ")}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <div className="rounded-xl border border-zinc-800 p-4 bg-zinc-900/50">
          <p className="text-sm text-zinc-300">
            {user?.isCreator
              ? "Share fresh collections in your Hub."
              : "Switch to Creator mode to publish your portfolio."}
          </p>
        </div>
        <Button href="/learn/new" className="w-full">
          Create Blog Post
        </Button>
        {
          user.isCreator && (
            <Button
          href="/hub"
          variant="outline"
          className="w-full"
        >
          Open Hub
        </Button>
          )
        }
        {/* <Button
          href="/hub"
          variant="outline"
          className="w-full"
        >
          Open Hub
        </Button> */}
      </div>
    </aside>
  );
}
