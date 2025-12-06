import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getCurrentSession() {
  return getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getCurrentSession()
  // return session?.user || null
  const user = session?.user

  // if user or id is missing, treat as not logged in
  if (!user || !user.id) {
    return null
  }

  return user

}
