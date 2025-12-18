// app/(auth)/layout.jsx
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/server/auth/auth-server"

export default async function AuthLayout({ children }) {
  const user = await getCurrentUser()

  if (user) {
    redirect("/")
  }

  return <>{children}</>
}
