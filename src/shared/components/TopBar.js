// 'use client';

// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { useState } from "react";
// import Avatar from "@/shared/ui/Avatar";
// import Button from "@/shared/ui/Button";
// import { useAuths } from "@/features/auth/hooks/useAuthMock";

// export default function TopBar() {
//   const pathname = usePathname();
//   const router = useRouter();
//   const { users, setUser } = useAuths();
//   const [query, setQuery] = useState("");

//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (!query) return;
//     router.push(`/search?q=${encodeURIComponent(query)}`);
//   };

//   const toggleCreator = () => {
//     setUser((prev) => ({ ...prev, isCreator: !prev?.isCreator }));
//   };

//   return (
//     <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900">
//       <div className="flex items-center justify-between px-4 sm:px-6 py-4 gap-4">
//         <div className="hidden md:flex items-center gap-3 text-sm text-zinc-400">
//           <span className="text-xs uppercase tracking-[0.2em] text-emerald-300">
//             {pathname === "/" ? "Home" : pathname.replace("/", "") || "Home"}
//           </span>
//           <div className="w-1 h-1 rounded-full bg-zinc-700" />
//           <span>Photography · Stories · Hub</span>
//         </div>

//         <form
//           onSubmit={handleSearch}
//           className="flex-1 flex max-w-xl items-center gap-3 bg-zinc-900/70 border border-zinc-800 rounded-full px-4 py-2"
//         >
//           <input
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             className="flex-1 bg-transparent outline-none text-sm text-zinc-100"
//             placeholder="Search people, photos, or blogs"
//           />
//           <button
//             type="submit"
//             className="text-sm text-emerald-300 hover:text-emerald-200"
//           >
//             ⌕
//           </button>
//         </form>

//         <div className="flex items-center gap-3">
//           <Button
//             variant="secondary"
//             size="sm"
//             onClick={toggleCreator}
//             className="hidden sm:inline-flex"
//           >
//             {users?.isCreator ? "Creator On" : "Creator Off"}
//           </Button>
//           <Link href={`/u/${users?.username || "you"}`}>
//             <div className="flex items-center gap-2">
//               <Avatar src={users?.avatar} size={40} />
//               <div className="hidden sm:block text-left">
//                 <p className="text-sm font-semibold text-white">
//                   {users?.name || "Guest"}
//                 </p>
//                 <p className="text-xs text-zinc-400">
//                   @{users?.username || "anon"}
//                 </p>
//               </div>
//             </div>
//           </Link>
//         </div>
//       </div>
//     </header>
//   );
// }


// ============================================
// 1. Simplified TopBar (Desktop + Mobile)
// ============================================
'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Menu } from "lucide-react";
import Avatar from "@/shared/ui/Avatar";
import useAuth from "@/features/auth/hooks/useAuth";

export default function TopBar() {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setShowSearch(false);
  };

  return (
    <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900">
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        {/* Logo (mobile only) */}
        <Link href="/" className="lg:hidden flex items-center gap-2">
          <span className="text-2xl">📸</span>
          <span className="font-semibold">Lumen</span>
        </Link>

        {/* Search Bar (desktop) */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-xl items-center gap-3 bg-zinc-900/70 border border-zinc-800 rounded-full px-4 py-2"
        >
          <Search size={18} className="text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-zinc-100 placeholder:text-zinc-500"
            placeholder="Search photos, people, or blogs"
          />
        </form>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Search icon (mobile) */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden p-2 hover:bg-zinc-800 rounded-lg transition"
          >
            <Search size={20} className="text-zinc-400" />
          </button>

          {/* User avatar */}
          <Link href={user?.username ? `/${user.username}` : "/login"}>
            <Avatar 
              src={user?.profile?.avatarUrl} 
              size={36}
              fallback={user?.profile?.displayName?.[0] || user?.email?.[0] || "U"}
            />
          </Link>
        </div>
      </div>

      {/* Mobile search (expanded) */}
      {showSearch && (
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearch} className="flex items-center gap-3 bg-zinc-900/70 border border-zinc-800 rounded-full px-4 py-2">
            <Search size={18} className="text-zinc-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-zinc-100 placeholder:text-zinc-500"
              placeholder="Search..."
              autoFocus
            />
          </form>
        </div>
      )}
    </header>
  );
}
