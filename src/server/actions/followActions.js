"use server";

import { prisma } from "@/server/db/prisma";
import { getCurrentUser } from "@/server/auth/auth-server";
import { revalidatePath } from "next/cache";

export async function toggleFollow(targetUserId) {
  try {
    const me = await getCurrentUser();
    if (!me) return { error: "Not authenticated" };

    if (!targetUserId) return { error: "Missing target userId" };
    if (targetUserId === me.id) return { error: "You cannot follow yourself" };

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: me.id,
          followingId: targetUserId,
        },
      },
      select: { followerId: true },
    });

    let following = false;

    if (existing) {
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: me.id,
            followingId: targetUserId,
          },
        },
      });
      following = false;
    } else {
      await prisma.follow.create({
        data: {
          followerId: me.id,
          followingId: targetUserId,
        },
      });
      following = true;
    }

    const followerCount = await prisma.follow.count({
      where: { followingId: targetUserId },
    });

    revalidatePath("/feed");
    revalidatePath("/profile");
    revalidatePath('/search');

    return { success: true, following, followerCount };
  } catch (err) {
    console.error("toggleFollow error:", err);
    return { error: "Failed to update follow" };
  }
}
