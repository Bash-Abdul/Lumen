"use server";

import { prisma } from "@/server/db/prisma";
import { getCurrentUser } from "@/server/auth/auth-server";
import { revalidatePath } from "next/cache";
import { ProfileUpdateSchema } from "@/features/profile/validation/profile";
import { AccountSecuritySchema } from "@/features/auth/validation/auth";
import { verifyPassword, hashPassword } from "@/server/auth/password";

export async function updateAccountProfile(formData){
    try {
        const currentUser = await getCurrentUser();
    
        if (!currentUser) {
          return { ok:false, error: "Not authenticated" };
        }
    
        // Extract form data
        const displayName = formData.get("displayName") ?? formData.get('name')
        const username = formData.get('username');
        const bio = formData.get('bio');
        const location = formData.get('location');
    
        // ✅ Validate with Zod
        const validated = ProfileUpdateSchema.safeParse({
          displayName,
          username,
          bio,
          location,
        });
    
        if (!validated.success) {
          const firstError = validated.error.errors[0];
          return {
            ok: false,
            error: firstError.message || "Validation failed",
            field: firstError.path[0],
          };
        }
    
        const data = validated.data;

        if (data.username) {
            const existingProfile = await prisma.profile.findUnique({
                where: { username: data.username },
                select: { id: true },
              })
        
              if (existingProfile && existingProfile.id !== currentUser.id) {
                return { ok: false, error: "Username is already taken",  field: "username"  }
              }
        }


        const profile = await prisma.profile.update({
            where: { id: currentUser.id },
            data: {
              displayName: data.displayName ?? undefined,
              username: data.username ?? undefined,
              bio: data.bio ?? undefined,
              location: data.location ?? undefined,
              // //  displayName:
              // //   displayName === undefined ? undefined : String(displayName).trim(),
              // displayName: displayName ? String(displayName).trim() : undefined,
              // username: normalizedUsername ?? undefined,
              // bio: bio === undefined ? undefined : String(bio).trim(),
              // location: location === undefined ? undefined : String(location).trim(),
              // avatarUrl:
              //   avatarUrl === undefined ? undefined : String(avatarUrl).trim(),
              // website: website === undefined ? undefined : String(website).trim(),
              // socials: socials === undefined ? undefined : socials,
            },
            select: {
                displayName: true,
                username: true,
                bio: true,
                location: true,
              },
          })
    
        revalidatePath("/account");
        revalidatePath("/profile");
    
        return { ok: true, profile };
      } catch (err) {
        console.error("Profile update error:", err);
        return { ok: false, error: `Failed to update profile ${err}` };
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
