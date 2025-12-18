// app/(protected)/layout.jsx
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/server/auth/auth-server"

export default async function ProtectedLayout({ children }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // if(!user.onboardingDone) redirect('onboarding');

  return <>{children}</>
}
