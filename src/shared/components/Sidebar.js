"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/shared/ui/Button";
import { useAuths } from "@/features/auth/hooks/useAuthMock";
import useAuth from "@/features/auth/hooks/useAuth";
import { House, Globe, Search, User, Book, BriefcaseBusiness, Badge } from "lucide-react";



export default function Sidebar() {
  const pathname = usePathname();
  const { users } = useAuths();
  const { user, isAuthenticated, logout, loading } = useAuth();

  const navItems = [
    { label: "Home", href: "/", icon:  <House className="w-5" /> },
    { label: "Feed", href: "/feed", icon:<Globe className="w-5" />  },
    { label: "Search", href: "/search", icon: <Search className="w-5" /> },
    // { label: "Profile", href: "/profile", icon: <User className="w-5" /> },
    { 
      label: "Profile", 
      href: user?.username ? `/${user.username}` : "/login",
      icon: <User className="w-5" />,
      requiresAuth: true 
    },
    { label: "Learn", href: "/learn", icon: <Book className="w-5" /> },
    { label: "Hub", href: "/hub", requiresCreator: true, icon: <BriefcaseBusiness className="w-5" /> },
    { label: "Account", href: "/account", requiresAuth: true, icon: <Badge className="w-5" /> },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-5 py-6 gap-6 sticky top-0 h-screen">
      <div className="flex items-center gap-2">
        {/* <div className="w-10 h-10 rounded-full bg-linear-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-black font-semibold">
          L
        </div> */}
        <div className="text-4xl flex items-center justify-center">
        📸
        </div>
        <div>
          <p className="text-lg font-semibold">Lumen</p>
          <p className="text-xs text-zinc-400">Photography playground</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems
          .filter((item) => {
            if (item.requiresCreator && !users?.isCreator) return false;
            if (item.requiresAuth && !isAuthenticated) return false;
            return true;
          })
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
                <span className="text-sm">{item.icon}</span>
                 <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>

      <div className="mt-auto space-y-3">
        <div className="rounded-xl border border-zinc-800 p-4 bg-zinc-900/50">
          <p className="text-sm text-zinc-300">
            {users?.isCreator
              ? "Share fresh collections in your Hub."
              : "Switch to Creator mode to publish your portfolio."}
          </p>
        </div>
        <Button
          href={isAuthenticated ? "/learn/new" : "/signup"}
          className="w-full"
        >
          {isAuthenticated ? "Create Blog Post" : "Sign Up"}
        </Button>
        {users?.isCreator && (
          <Button
            href={isAuthenticated ? "/hub" : "/login"}
            variant="outline"
            className="w-full"
          >
            {isAuthenticated ? "Open Hub" : "Sign In"}
          </Button>
        )}
        {
          isAuthenticated && <Button onClick={logout} disabled={loading} variant="outline" className="w-full cursor-pointer">{ loading ? '...' : 'Sign Out' }</Button>
        }
      </div>
    </aside>
  );
}
