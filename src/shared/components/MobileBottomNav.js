'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Globe, Search, User, Book, BriefcaseBusiness } from "lucide-react";
import useAuth from "@/features/auth/hooks/useAuth";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const navItems = [
    { label: "Home", href: "/", icon: House },
    { label: "Feed", href: "/feed", icon: Globe },
    { label: "Search", href: "/search", icon: Search },
    { label: "Learn", href: "/learn", icon: Book },
    { 
      label: "Profile", 
      href: user?.username ? `/${user.username}` : "/login",
      icon: User 
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? "text-emerald-400"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}