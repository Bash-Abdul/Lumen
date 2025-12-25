import prisma from "@/server/db/prisma";
import { getCurrentUser } from "@/server/auth/auth-server";

export async function getAccountProfileData(){
    const currentUser = await getCurrentUser();

    if (!currentUser) {
        return { ok: false, code: "NOT_AUTHENTICATED", error: "Not authenticated" };
    }

    const profile = await prisma.profile.findUnique({
        where: { id: currentUser.id },
        select: {
          displayName: true,
          username: true,
          location: true,
          bio: true,
        }
      })

      if (!profile) {
        return { ok: false, code: "NOT_FOUND", error: "Profile not found" };
      }


      return {ok: true, profile}
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
    ok: true,
    account: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    },
  }
}
