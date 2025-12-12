"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";
// import { ProfileUpdateSchema } from "@/lib/validations/profile";
import { ProfileUpdateSchema } from "../validation/profile";
import { AccountSecuritySchema } from "../validation/auth";
import { verifyPassword, hashPassword } from "../password";

export async function updateProfile(formData) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { error: "Not authenticated" };
    }

    // Extract form data
    const displayName = formData.get("displayName");
    const username = formData.get("username");
    const bio = formData.get("bio");
    const location = formData.get("location");
    const avatarUrl = formData.get("avatarUrl");
    const website = formData.get("website");

    // Parse socials JSON
    const socialsJson = formData.get("socials");
    const socials = socialsJson ? JSON.parse(socialsJson) : null;

    // ✅ Validate with Zod
    const validated = ProfileUpdateSchema.safeParse({
      displayName,
      username,
      bio,
      location,
      avatarUrl,
      website,
      socials,
    });

    if (!validated.success) {
      const firstError = validated.error.errors[0];
      return {
        error: firstError.message || "Validation failed",
        field: firstError.path[0],
      };
    }

    const data = validated.data;

    // Check if username is taken
    if (data.username) {
      const existingProfile = await prisma.profile.findUnique({
        where: { username: data.username },
        select: { id: true },
      });

      if (existingProfile && existingProfile.id !== currentUser.id) {
        return { error: "Username is already taken", field: "username" };
      }
    }

    // Update profile
    const profile = await prisma.profile.update({
      where: { id: currentUser.id },
      data: {
        displayName: data.displayName ?? undefined,
        username: data.username ?? undefined,
        bio: data.bio ?? undefined,
        location: data.location ?? undefined,
        avatarUrl: data.avatarUrl ?? undefined,
        website: data.website ?? undefined,
        socials: data.socials ?? undefined,
      },
    });

    revalidatePath("/profile");
    revalidatePath('/account')

    return { success: true, profile };
  } catch (err) {
    console.error("Profile update error:", err);
    return { error: "Failed to update profile" };
  }
}


export async function updateAccount(formData) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { error: "Not authenticated" };
    }

    // Extract form data
    const email = formData.get('email')
    const prevPassword = formData.get('prevPassword');
    const newPassword = formData.get('newPassword');

    // ✅ Validate with Zod
    const validated = AccountSecuritySchema.safeParse({
      email,
      prevPassword,
      newPassword
    });

    if (!validated.success) {
      const firstError = validated.error.errors[0];
      return {
        error: firstError.message || "Validation failed",
        field: firstError.path[0],
      };
    }

    const data = validated.data;

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!user || !user.passwordHash) {
      return { ok: false, error: "User not found" };
    }

    const valid = await verifyPassword(user.passwordHash, data.prevPassword)

    if (!valid) {
      return { ok: false, error: "Current password is incorrect", field: "prevPassword" };
    }

    // if email is changing, make sure it is not already used
    if (data.email !== user.email) {
      const existingWithEmail = await prisma.user.findUnique({
        where: { email: data.email },
        select: { id: true },
      });

      if (existingWithEmail) {
        return { ok: false, error: "Email is already in use" };
      }
    }

    const newHash = await hashPassword(data.newPassword);


    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: data.email,
        passwordHash: newHash,
      },
    });

    revalidatePath("/account");
    revalidatePath("/profile");

    return { success: true };
  } catch (err) {
    console.error("Profile update error:", err);
    return { error: `Failed to update profile ${err}` };
  }
}