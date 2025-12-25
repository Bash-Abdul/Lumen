// "use client";

// import { useState, useEffect, useTransition } from "react";
// // import Button from "../../shared/ui/Button";
// import Button from "@/shared/ui/Button";
// // import { useAuths } from "../../@/features/auth/hooks/useAuthMock";
// import { useAuths } from "@/features/auth/hooks/useAuthMock";
// import api from "@/shared/lib/api";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import useAuth from "@/features/auth/hooks/useAuth";
// import { signOut } from "next-auth/react";

// function Section({ title, children }) {
//     return (
//         <div className="card p-5 space-y-3">
//             <h3 className="text-lg font-semibold">{title}</h3>
//             {children}
//         </div>
//     );
// }

// function ProfileSkeleton() {
//     return (
//         <div className="space-y-3 animate-pulse">
//             <div className="grid sm:grid-cols-2 gap-3">
//                 <div className="h-11 rounded-xl bg-zinc-800/70" />
//                 <div className="h-11 rounded-xl bg-zinc-800/70" />
//             </div>
//             <div className="h-11 rounded-xl bg-zinc-800/70" />
//             <div className="h-24 rounded-xl bg-zinc-800/70" />
//             <div className="h-9 w-28 rounded-full bg-zinc-800/70" />
//         </div>
//     );
// }

// export default function AccountPageClient({
//     initialAccount,
//     updateAccountAction,
//     initialAccountProfile,
//     updateAccountProfileAction,
// }) {

//     const { logout } = useAuth();
//     const router = useRouter();
//     // const { users, setUser } = useAuths();
//     const users = {
//         isCreator: true
//     }
//     const [form, setForm] = useState({
//         name: "",
//         username: "",
//         bio: "",
//         location: "",
//     });

//     const [accountProfileForm, getAccountProfileForm] = useState({
//         name: initialAccountProfile.name,
//         username: initialAccountProfile.username,
//         bio: initialAccountProfile.bio,
//         location: initialAccountProfile.location,
//     })

//     const [loadingProfile, setLoadingProfile] = useState(true);
//     const [savingProfile, setSavingProfile] = useState(false);
//     const [error, setError] = useState("");

//     const [showAccounProfiletEdit, setShowAccountProfileEdit] = useState(false);
//     const [accountProfileErrors, setAccountProfileErrors] = useState({});
//     const [isPending, startTransition] = useTransition();

//     // const handleSave = (e) => {
//     //   e.preventDefault();
//     //   setUser((prev) => ({ ...prev, ...form }));
//     // };


//     const handleSaveAccountProfile = async (e) => {
//         e.preventDefault();
//         setAccountProfileErrors({});

//         setSavingProfile(true);

//         const formData = new FormData();
//         formData.append("displayName", accountProfileForm.name);
//         formData.append("username", accountProfileForm.username);
//         formData.append("bio", accountProfileForm.bio);
//         formData.append("location", accountProfileForm.location);


//         startTransition(async () => {
//             const result = await updateAccountProfileAction(formData);

//             if (result?.okay === false) {
//                 const msg = result?.error || result?.message || "Failed to update profile";
//                 if (result?.field) setAccountProfileErrors({ [result.field]: msg });
//                 else setAccountProfileErrors({ general: msg });
//                 toast.error(msg);
//                 setSavingProfile(false);
//                 return;
//             }

//                 toast.success("Profile updated");
//                 router.refresh();
//                 setSavingProfile(false);
//         });
//     };


//     async function getProfileData() {
//         try {
//             setError("");
//             setLoadingProfile(true);

//             // consume api /profile
//             const res = await api.get("/profile");
//             const { ok, profile } = res.data;
//             if (!ok) {
//                 throw new Error(res.data?.message || "Failed to load profile");
//             }

//             setForm({
//                 name: profile.displayName || "",
//                 username: profile.username || "",
//                 bio: profile.bio || "",
//                 location: profile.location || "",
//             });
//         } catch (err) {
//             console.error("Failed to load profile", err);
//             setError(err instanceof Error ? err.message : "Failed to load profile");
//         } finally {
//             setLoadingProfile(false);
//         }
//     }

//     useEffect(() => {
//         getProfileData();
//     }, []);

//     // Update Profile function
//     const handleSaveProfile = async (e) => {
//         e.preventDefault();
//         setError("");
//         setSavingProfile(true);

//         try {
//             const payload = {
//                 displayName: form.name,
//                 username: form.username,
//                 bio: form.bio,
//                 location: form.location,
//             };

//             const res = await api.patch("/profile", payload);
//             const { ok, profile, message } = res.data;
//             if (!ok) {
//                 throw new Error(message || "Failed to update profile");
//             }

//             // Sync form with whatever backend returned
//             setForm({
//                 name: profile.displayName || "",
//                 username: profile.username || "",
//                 bio: profile.bio || "",
//                 location: profile.location || "",
//             });
//             router.push("/profile");
//         } catch (error) {
//             console.error("Profile update error", err);
//             setError(err instanceof Error ? err.message : "Failed to update profile");
//         } finally {
//             setSavingProfile(false);
//         }
//     };



//     // Account form
//     const [accountForm, setAccountForm] = useState({
//         email: initialAccount.email,
//         prevPassword: "",
//         newPassword: "",
//     });
//     const [showAccountEdit, setShowAccountEdit] = useState(false);
//     const [accountErrors, setAccountErrors] = useState({});
//     // const [isPending, startTransition] = useTransition();

//     // Handle Account Save
//     const handleSaveAccount = async (e) => {
//         e.preventDefault();
//         setAccountErrors({});

//         // Validation
//         if (!accountForm.prevPassword) {
//             setAccountErrors({ prevPassword: "Current password is required" });
//             return;
//         }

//         if (!accountForm.newPassword || accountForm.newPassword.length < 8) {
//             setAccountErrors({
//                 newPassword: "New password must be at least 8 characters",
//             });
//             return;
//         }

//         const formData = new FormData();
//         formData.append("email", accountForm.email);
//         formData.append("prevPassword", accountForm.prevPassword);
//         formData.append("newPassword", accountForm.newPassword);

//         startTransition(async () => {
//             const result = await updateAccountAction(formData);

//             if (result?.error) {
//                 if (result.field) {
//                     setAccountErrors({ [result.field]: result.error });
//                 } else {
//                     setAccountErrors({ general: result.error });
//                 }
//                 toast.error(result.error);
//             } else {
//                 toast.success("Account updated! Please log in again.");
//                 // Reset form
//                 setAccountForm({
//                     email: accountForm.email,
//                     prevPassword: "",
//                     newPassword: "",
//                 });
//                 setShowAccountEdit(false);
//                 router.refresh();
//                 // This will clear the session and redirect
//                 await signOut({
//                     callbackUrl: "/login", // or "/" or wherever
//                 });
//                 // Optionally redirect to login
//                 // router.push("/login");
//             }
//         });
//     };


//     const [updateMock, setUpdateMock] = useState(false);

//     return (
//         <div className="space-y-6">
//             <div>
//                 <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
//                     Account
//                 </p>
//                 <h1 className="text-3xl font-semibold">Settings</h1>
//                 <p className="text-sm text-zinc-400">
//                     Profile, account, creator toggle, and plan information.
//                 </p>
//             </div>

//             <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
//                 <Section title="Profile">
//                     {loadingProfile ? (
//                         <ProfileSkeleton />
//                     ) : (
//                         <form onSubmit={handleSaveAccountProfile} className="space-y-3">
//                                  {accountProfileErrors.general && (
//               <p className="text-xs text-red-400">{accountProfileErrors.general}</p>
//             )}

//                             <div className="grid sm:grid-cols-2 gap-3">
//                                 <input
//                                     value={form.name}
//                                     onChange={(e) => setForm({ ...form, name: e.target.value })}
//                                     placeholder="Name"
//                                     className="rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
//                                 />
//                                 <input
//                                     value={form.username}
//                                     onChange={(e) =>
//                                         setForm({ ...form, username: e.target.value })
//                                     }
//                                     placeholder="Username"
//                                     className="rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
//                                 />
//                             </div>
//                             <input
//                                 value={form.location}
//                                 onChange={(e) => setForm({ ...form, location: e.target.value })}
//                                 placeholder="Location"
//                                 className="rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
//                             />
//                             <textarea
//                                 value={form.bio}
//                                 onChange={(e) => setForm({ ...form, bio: e.target.value })}
//                                 placeholder="Bio"
//                                 rows={3}
//                                 className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
//                             />

//                             {error && <p className="text-xs text-red-400">{error}</p>}

//                             <Button type="submit" size="sm" disabled={savingProfile}>
//                                 {savingProfile ? "Saving..." : "Save profile"}
//                             </Button>
//                             <p className="text-xs text-zinc-400">
//                                 Updates your profile via PATCH /api/profile.
//                             </p>
//                         </form>
//                     )}
//                 </Section>

//                 <div className="space-y-4">

//                     <Section title="Account">
//                         {!showAccountEdit ? (
//                             <div className="space-y-3">
//                                 <div className="text-sm text-zinc-300">
//                                     <p className="mb-2">
//                                         <span className="text-zinc-500">Email:</span>{" "}
//                                         {initialAccount.email}
//                                     </p>
//                                     <p>
//                                         <span className="text-zinc-500">Password:</span> ••••••••
//                                     </p>
//                                 </div>
//                                 <Button
//                                     onClick={() => setShowAccountEdit(true)}
//                                     variant="secondary"
//                                     size="sm"
//                                 >
//                                     Update credentials
//                                 </Button>
//                             </div>
//                         ) : (
//                             <form onSubmit={handleSaveAccount} className="space-y-3">
//                                 {accountErrors.general && (
//                                     <p className="text-xs text-red-400">
//                                         {accountErrors.general}
//                                     </p>
//                                 )}

//                                 <div>
//                                     <input
//                                         type="email"
//                                         value={accountForm.email}
//                                         onChange={(e) =>
//                                             setAccountForm({ ...accountForm, email: e.target.value })
//                                         }
//                                         placeholder="New email"
//                                         disabled={isPending}
//                                         className={`w-full rounded-xl bg-zinc-900/80 border px-4 py-3 text-sm text-zinc-100 focus:outline-none disabled:opacity-50 ${accountErrors.email
//                                                 ? "border-red-500 focus:border-red-400"
//                                                 : "border-zinc-800 focus:border-emerald-400"
//                                             }`}
//                                     />
//                                     {accountErrors.email && (
//                                         <p className="text-xs text-red-400 mt-1">
//                                             {accountErrors.email}
//                                         </p>
//                                     )}
//                                 </div>

//                                 <div>
//                                     <input
//                                         type="password"
//                                         value={accountForm.prevPassword}
//                                         onChange={(e) =>
//                                             setAccountForm({
//                                                 ...accountForm,
//                                                 prevPassword: e.target.value,
//                                             })
//                                         }
//                                         placeholder="Current password"
//                                         disabled={isPending}
//                                         className={`w-full rounded-xl bg-zinc-900/80 border px-4 py-3 text-sm text-zinc-100 focus:outline-none disabled:opacity-50 ${accountErrors.prevPassword
//                                                 ? "border-red-500 focus:border-red-400"
//                                                 : "border-zinc-800 focus:border-emerald-400"
//                                             }`}
//                                     />
//                                     {accountErrors.prevPassword && (
//                                         <p className="text-xs text-red-400 mt-1">
//                                             {accountErrors.prevPassword}
//                                         </p>
//                                     )}
//                                 </div>

//                                 <div>
//                                     <input
//                                         type="password"
//                                         value={accountForm.newPassword}
//                                         onChange={(e) =>
//                                             setAccountForm({
//                                                 ...accountForm,
//                                                 newPassword: e.target.value,
//                                             })
//                                         }
//                                         placeholder="New password (min 8 chars)"
//                                         disabled={isPending}
//                                         className={`w-full rounded-xl bg-zinc-900/80 border px-4 py-3 text-sm text-zinc-100 focus:outline-none disabled:opacity-50 ${accountErrors.newPassword
//                                                 ? "border-red-500 focus:border-red-400"
//                                                 : "border-zinc-800 focus:border-emerald-400"
//                                             }`}
//                                     />
//                                     {accountErrors.newPassword && (
//                                         <p className="text-xs text-red-400 mt-1">
//                                             {accountErrors.newPassword}
//                                         </p>
//                                     )}
//                                 </div>

//                                 <div className="flex gap-2">
//                                     <Button
//                                         type="button"
//                                         onClick={() => {
//                                             setShowAccountEdit(false);
//                                             setAccountErrors({});
//                                             setAccountForm({
//                                                 email: initialAccount.email,
//                                                 prevPassword: "",
//                                                 newPassword: "",
//                                             });
//                                         }}
//                                         variant="ghost"
//                                         size="sm"
//                                         disabled={isPending}
//                                     >
//                                         Cancel
//                                     </Button>
//                                     <Button type="submit" size="sm" disabled={isPending}>
//                                         {isPending ? "Saving..." : "Save changes"}
//                                     </Button>
//                                 </div>
//                             </form>
//                         )}
//                     </Section>

//                     {/* <Section title="Account">
//             <div className="space-y-2 text-sm text-zinc-300">
//               {!updateMock ? (
//                 <>
//                   <p className="mb-4">Email: you@example.com</p>
//                   <p className="mb-4">Password: •••••••• (placeholder)</p>
//                 </>
//               ) : (
//                 <>
//                   <input
//                     type="email"
//                     className="p-2 bg-stone-900 block mb-2"
//                     placeholder="enter new email"
//                   />
//                   <input
//                     type="password"
//                     className="p-2 bg-stone-900 block mb-2"
//                     placeholder="enter former password"
//                   />

//                   <input
//                     type="password"
//                     className="p-2 bg-stone-900 block mb-2"
//                     placeholder="enter new password"
//                   />
//                 </>
//               )}
//               <Button
//                 onClick={() => setUpdateMock((prev) => !prev)}
//                 variant="secondary"
//                 size="sm"
//               >
//                 {updateMock ? "save update" : "Update credentials (mock)"}
//               </Button>
//               <p className="text-xs text-zinc-500">
//                 Future endpoint: POST /api/account/update
//               </p>
//             </div>
//           </Section> */}


//                     <Section title="Creator mode">
//                         <p className="text-sm text-zinc-300">
//                             Toggle to unlock Hub and portfolio tools.
//                         </p>
//                         <Button
//                             variant={users?.isCreator ? "primary" : "secondary"}
//                             size="sm"
//                             onClick={() =>
//                                 setUser((prev) => ({ ...prev, isCreator: !prev?.isCreator }))
//                             }
//                         >
//                             {users?.isCreator ? "Creator enabled" : "Enable creator"}
//                         </Button>
//                     </Section>
//                     <Section title="Plan">
//                         <p className="text-sm text-zinc-300">Current plan: {users?.plan}</p>
//                         <p className="text-xs text-zinc-500">
//                             Billing endpoints will live under /api/billing and integrate a
//                             payment provider.
//                         </p>
//                     </Section>
//                 </div>
//             </div>
//         </div>
//     );
// }



"use client";

import { useState, useTransition } from "react";
import Button from "@/shared/ui/Button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signOut } from "next-auth/react";

function Section({ title, children }) {
  return (
    <div className="card p-5 space-y-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}

export default function AccountPageClient({
  initialAccount,
  updateAccountAction,
  initialAccountProfile,
  updateAccountProfileAction,
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const users = { isCreator: true };

  // Profile form for Account page (accountProfile)
  const [accountProfileForm, setAccountProfileForm] = useState({
    name: initialAccountProfile?.name || "",
    username: initialAccountProfile?.username || "",
    bio: initialAccountProfile?.bio || "",
    location: initialAccountProfile?.location || "",
  });

  const [accountProfileErrors, setAccountProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const handleSaveAccountProfile = async (e) => {
    e.preventDefault();
    setAccountProfileErrors({});
    setSavingProfile(true);

    const formData = new FormData();
    formData.append("displayName", accountProfileForm.name);
    formData.append("username", accountProfileForm.username);
    formData.append("bio", accountProfileForm.bio);
    formData.append("location", accountProfileForm.location);

    startTransition(async () => {
      const result = await updateAccountProfileAction(formData);

      // support both shapes: { ok:false, error } or { error }
      const hasError = result?.ok === false || result?.error;

      if (hasError) {
        const msg = result?.error || result?.message || "Failed to update profile";
        if (result?.field) setAccountProfileErrors({ [result.field]: msg });
        else setAccountProfileErrors({ general: msg });
        toast.error(msg);
        setSavingProfile(false);
        return;
      }

      toast.success("Profile updated!");
      router.refresh();
      setSavingProfile(false);
    });
  };

  // Account security form
  const [accountForm, setAccountForm] = useState({
    email: initialAccount.email,
    prevPassword: "",
    newPassword: "",
  });

  const [showAccountEdit, setShowAccountEdit] = useState(false);
  const [accountErrors, setAccountErrors] = useState({});

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setAccountErrors({});

    if (!accountForm.prevPassword) {
      setAccountErrors({ prevPassword: "Current password is required" });
      return;
    }

    if (!accountForm.newPassword || accountForm.newPassword.length < 8) {
      setAccountErrors({ newPassword: "New password must be at least 8 characters" });
      return;
    }

    const formData = new FormData();
    formData.append("email", accountForm.email);
    formData.append("prevPassword", accountForm.prevPassword);
    formData.append("newPassword", accountForm.newPassword);

    startTransition(async () => {
      const result = await updateAccountAction(formData);

      if (result?.error || result?.ok === false) {
        const msg = result?.error || result?.message || "Failed to update account";
        if (result?.field) setAccountErrors({ [result.field]: msg });
        else setAccountErrors({ general: msg });
        toast.error(msg);
        return;
      }

      toast.success("Account updated! Please log in again.");

      setAccountForm({
        email: accountForm.email,
        prevPassword: "",
        newPassword: "",
      });

      setShowAccountEdit(false);
      router.refresh();

      await signOut({ callbackUrl: "/login" });
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
          Account
        </p>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-sm text-zinc-400">
          Profile, account, creator toggle, and plan information.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
        <Section title="Profile">
          <form onSubmit={handleSaveAccountProfile} className="space-y-3">
            {accountProfileErrors.general && (
              <p className="text-xs text-red-400">{accountProfileErrors.general}</p>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <input
                  value={accountProfileForm.name}
                  onChange={(e) =>
                    setAccountProfileForm({ ...accountProfileForm, name: e.target.value })
                  }
                  placeholder="Name"
                  disabled={isPending}
                  className={`w-full rounded-xl bg-zinc-900/80 border px-4 py-3 text-sm text-zinc-100 focus:outline-none disabled:opacity-50 ${
                    accountProfileErrors.displayName
                      ? "border-red-500 focus:border-red-400"
                      : "border-zinc-800 focus:border-emerald-400"
                  }`}
                />
                {accountProfileErrors.displayName && (
                  <p className="text-xs text-red-400 mt-1">
                    {accountProfileErrors.displayName}
                  </p>
                )}
              </div>

              <div>
                <input
                  value={accountProfileForm.username}
                  onChange={(e) =>
                    setAccountProfileForm({
                      ...accountProfileForm,
                      username: e.target.value,
                    })
                  }
                  placeholder="Username"
                  disabled={isPending}
                  className={`w-full rounded-xl bg-zinc-900/80 border px-4 py-3 text-sm text-zinc-100 focus:outline-none disabled:opacity-50 ${
                    accountProfileErrors.username
                      ? "border-red-500 focus:border-red-400"
                      : "border-zinc-800 focus:border-emerald-400"
                  }`}
                />
                {accountProfileErrors.username && (
                  <p className="text-xs text-red-400 mt-1">
                    {accountProfileErrors.username}
                  </p>
                )}
              </div>
            </div>

            <div>
              <input
                value={accountProfileForm.location}
                onChange={(e) =>
                  setAccountProfileForm({
                    ...accountProfileForm,
                    location: e.target.value,
                  })
                }
                placeholder="Location"
                disabled={isPending}
                className={`w-full rounded-xl bg-zinc-900/80 border px-4 py-3 text-sm text-zinc-100 focus:outline-none disabled:opacity-50 ${
                  accountProfileErrors.location
                    ? "border-red-500 focus:border-red-400"
                    : "border-zinc-800 focus:border-emerald-400"
                }`}
              />
              {accountProfileErrors.location && (
                <p className="text-xs text-red-400 mt-1">
                  {accountProfileErrors.location}
                </p>
              )}
            </div>

            <div>
              <textarea
                value={accountProfileForm.bio}
                onChange={(e) =>
                  setAccountProfileForm({ ...accountProfileForm, bio: e.target.value })
                }
                placeholder="Bio"
                rows={3}
                disabled={isPending}
                className={`w-full rounded-xl bg-zinc-900/80 border px-4 py-3 text-sm text-zinc-100 focus:outline-none disabled:opacity-50 ${
                  accountProfileErrors.bio
                    ? "border-red-500 focus:border-red-400"
                    : "border-zinc-800 focus:border-emerald-400"
                }`}
              />
              {accountProfileErrors.bio && (
                <p className="text-xs text-red-400 mt-1">{accountProfileErrors.bio}</p>
              )}
            </div>

            <Button type="submit" size="sm" disabled={savingProfile || isPending}>
              {savingProfile || isPending ? "Saving..." : "Save profile"}
            </Button>

            <p className="text-xs text-zinc-400">
              Updates your profile via accountProfile server action.
            </p>
          </form>
        </Section>

        <div className="space-y-4">
          <Section title="Account">
            {!showAccountEdit ? (
              <div className="space-y-3">
                <div className="text-sm text-zinc-300">
                  <p className="mb-2">
                    <span className="text-zinc-500">Email:</span> {initialAccount.email}
                  </p>
                  <p>
                    <span className="text-zinc-500">Password:</span> ••••••••
                  </p>
                </div>
                <Button
                  onClick={() => setShowAccountEdit(true)}
                  variant="secondary"
                  size="sm"
                >
                  Update credentials
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSaveAccount} className="space-y-3">
                {accountErrors.general && (
                  <p className="text-xs text-red-400">{accountErrors.general}</p>
                )}

                <div>
                  <input
                    type="email"
                    value={accountForm.email}
                    onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                    placeholder="New email"
                    disabled={isPending}
                    className={`w-full rounded-xl bg-zinc-900/80 border px-4 py-3 text-sm text-zinc-100 focus:outline-none disabled:opacity-50 ${
                      accountErrors.email
                        ? "border-red-500 focus:border-red-400"
                        : "border-zinc-800 focus:border-emerald-400"
                    }`}
                  />
                  {accountErrors.email && (
                    <p className="text-xs text-red-400 mt-1">{accountErrors.email}</p>
                  )}
                </div>

                <div>
                  <input
                    type="password"
                    value={accountForm.prevPassword}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, prevPassword: e.target.value })
                    }
                    placeholder="Current password"
                    disabled={isPending}
                    className={`w-full rounded-xl bg-zinc-900/80 border px-4 py-3 text-sm text-zinc-100 focus:outline-none disabled:opacity-50 ${
                      accountErrors.prevPassword
                        ? "border-red-500 focus:border-red-400"
                        : "border-zinc-800 focus:border-emerald-400"
                    }`}
                  />
                  {accountErrors.prevPassword && (
                    <p className="text-xs text-red-400 mt-1">
                      {accountErrors.prevPassword}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="password"
                    value={accountForm.newPassword}
                    onChange={(e) =>
                      setAccountForm({ ...accountForm, newPassword: e.target.value })
                    }
                    placeholder="New password (min 8 chars)"
                    disabled={isPending}
                    className={`w-full rounded-xl bg-zinc-900/80 border px-4 py-3 text-sm text-zinc-100 focus:outline-none disabled:opacity-50 ${
                      accountErrors.newPassword
                        ? "border-red-500 focus:border-red-400"
                        : "border-zinc-800 focus:border-emerald-400"
                    }`}
                  />
                  {accountErrors.newPassword && (
                    <p className="text-xs text-red-400 mt-1">
                      {accountErrors.newPassword}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowAccountEdit(false);
                      setAccountErrors({});
                      setAccountForm({
                        email: initialAccount.email,
                        prevPassword: "",
                        newPassword: "",
                      });
                    }}
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={isPending}>
                    {isPending ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            )}
          </Section>

          <Section title="Creator mode">
            <p className="text-sm text-zinc-300">
              Toggle to unlock Hub and portfolio tools.
            </p>
            <Button variant={users?.isCreator ? "primary" : "secondary"} size="sm">
              {users?.isCreator ? "Creator enabled" : "Enable creator"}
            </Button>
          </Section>

          <Section title="Plan">
            <p className="text-sm text-zinc-300">Current plan: {users?.plan}</p>
            <p className="text-xs text-zinc-500">
              Billing endpoints will live under /api/billing and integrate a payment provider.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
