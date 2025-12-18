'use client';

import Tabs from "@/shared/ui/Tabs";
import Button from "@/shared/ui/Button";

const FEED_TABS = [
  { key: "forYou", label: "For You" },
  { key: "following", label: "Following" },
];

export default function FeedTabs({ active = "forYou", onChange, isAuthenticated }) {
  let display = null;
  if (isAuthenticated){
    display = <Tabs tabs={FEED_TABS} activeKey={active} onChange={onChange} />
  }else {
    display =<div className="flex gap-2"><Button href={'/login'}>Login</Button> <Button href={'/signup'} >Sign Up</Button></div>
  }
  return display;
}

// 'use client';

// import Link from "next/link";
// import { usePathname } from "next/navigation";

// // interface FeedTabsProps {
// //   isAuthenticated: boolean;
// //   active: 'forYou' | 'following';
// // }

// export default function FeedTabs({ isAuthenticated, active = "forYou" }) {
//   const pathname = usePathname();

//   const tabs = [
//     { id: 'forYou', label: 'For You', href: '/feed?type=forYou' },
//     { 
//       id: 'following', 
//       label: 'Following', 
//       href: '/feed?type=following',
//       requiresAuth: true 
//     },
//   ];

//   return (
//     <div className="flex gap-2 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800">
//       {tabs.map((tab) => {
//         const isActive = active === tab.id;
//         const isDisabled = tab.requiresAuth && !isAuthenticated;

//         if (isDisabled) {
//           return (
//             <button
//               key={tab.id}
//               disabled
//               className="px-4 py-2 rounded-md text-sm font-medium text-zinc-600 cursor-not-allowed"
//               title="Sign in to view following feed"
//             >
//               {tab.label}
//             </button>
//           );
//         }

//         return (
//           <Link
//             key={tab.id}
//             href={tab.href}
//             className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
//               isActive
//                 ? 'bg-emerald-500 text-white'
//                 : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
//             }`}
//           >
//             {tab.label}
//           </Link>
//         );
//       })}
//     </div>
//   );
// }
