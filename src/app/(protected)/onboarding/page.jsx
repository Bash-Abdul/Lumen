// 'use client';

// import { useState } from "react";
// import Button from "../../../shared/ui/Button";
// import { useAuths } from "../../../@/features/auth/hooks/useAuthMock";

// export default function OnboardingPage() {
//   const { setUser } = useAuths();
//   const [form, setForm] = useState({
//     displayName: "",
//     username: "",
//     location: "",
//     bio: "",
//     avatar: "",
//   });
//   const [status, setStatus] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setStatus("Saving...");
//     // TODO: replace with POST /api/onboarding to persist profile + avatar upload.
//     setUser((prev) => ({
//       ...prev,
//       name: form.name || prev?.name,
//       username: form.username || prev?.username,
//       location: form.location,
//       bio: form.bio,
//       avatar: form.avatar || prev?.avatar,
//     }));
//     setStatus("Saved locally (no backend yet). Profile data would persist via API.");
//   };

//   return (
//     <div className="flex items-center justify-center h-full">
//       <div className="max-w-3xl mx-auto space-y-6">
//       <div className="space-y-2 text-center">
//         <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
//           Onboarding
//         </p>
//         <h1 className="text-3xl font-semibold">Set up your profile</h1>
//         <p className="text-sm text-zinc-400">
//           No backend yet — this just updates local state. Connect to API later.
//         </p>
//       </div>

//       <form onSubmit={handleSubmit} className="card p-6 space-y-4">
//         <div className="grid sm:grid-cols-2 gap-3">
//           <input
//             value={form.name}
//             onChange={(e) => setForm({ ...form, name: e.target.value })}
//             placeholder="Name"
//             required
//             className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
//           />
//           <input
//             value={form.username}
//             onChange={(e) => setForm({ ...form, username: e.target.value })}
//             placeholder="@username"
//             pattern="^@?\\w{3,}$"
//             title="At least 3 characters; letters, numbers, underscore"
//             required
//             className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
//           />
//         </div>
//         <input
//           value={form.location}
//           onChange={(e) => setForm({ ...form, location: e.target.value })}
//           placeholder="Location (optional)"
//           className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
//         />
//         <textarea
//           value={form.bio}
//           onChange={(e) => setForm({ ...form, bio: e.target.value })}
//           placeholder="Bio (optional)"
//           rows={3}
//           className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
//         />
//         <input
//           value={form.avatar}
//           onChange={(e) => setForm({ ...form, avatar: e.target.value })}
//           placeholder="Avatar URL (optional)"
//           className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
//         />
//         <Button type="submit" className="w-full">
//           Continue
//         </Button>
//         {status && <p className="text-xs text-zinc-400">{status}</p>}
//       </form>
//     </div>
//     </div>
//   );
// }

// app/(protected)/onboarding/page.jsx
import { redirect } from "next/navigation"
import prisma from "@/server/db/prisma"
import { getCurrentUser } from "@/server/auth/auth-server"
import OnboardingClient from "./OnboardingClient"

export default async function OnboardingPage() {
  const user = await getCurrentUser()

  if (!user || !user.id) {
    redirect("/login")
  }

  if (user.onboardingDone) {
    redirect("/")
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: {
      displayName: true,
      username: true,
      bio: true,
      location: true,
      avatarUrl: true,
    },
  })

  const initialProfile = {
    name: profile?.displayName || "",
    username: profile?.username || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
    avatar: profile?.avatarUrl || "",
  }

  return <OnboardingClient initialProfile={initialProfile} />
}

