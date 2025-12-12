import prisma from "../prisma";
import { getCurrentUser } from "../auth-server";

export async function getProfileData(){
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return { ok: false, code: "NOT_AUTHENTICATED", error: "Not authenticated" };
    }

    const profile = await prisma.profile.findUnique({
        where: { id: currentUser.id },
      })

      if (!profile) {
        return { ok: false, code: "NOT_FOUND", error: "Profile not found" };
      }

      return profile
}

export async function getAccount(){
  const currentUser = await getCurrentUser();

  if (!currentUser) {
      return { ok: false, code: "NOT_AUTHENTICATED", error: "Not authenticated" };
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  })

  if (!user){
    return { ok: false, code: "NOT_FOUND", error: "User not found" };
  }

  return {
    id: user.id,
    email:user.email,
    createdAt: user.createdAt
  }
}