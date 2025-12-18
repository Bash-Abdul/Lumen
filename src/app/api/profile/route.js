import { NextResponse } from "next/server"
import prisma from "@/server/db/prisma"
import { getCurrentUser } from "@/server/auth/auth-server"
import { ProfileUpdateSchema } from "@/features/profile/validation/profile"

export async function GET() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return NextResponse.json(
      { ok: false, message: "Not authenticated" },
      { status: 401 },
    )
  }

  const profile = await prisma.profile.findUnique({
    where: { id: currentUser.id },
  })

  return NextResponse.json({ ok: true, profile })
}

export async function PATCH(req) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { ok: false, message: "Not authenticated" },
        { status: 401 },
      )
    }

    const body = await req.json()

    const parsedData = ProfileUpdateSchema.safeParse(body);

    if (!parsedData.success) {
      const firstIssue = parsedData.error.issues[0];
      return NextResponse.json(
        { ok: false, message: firstIssue?.message || "Invalid profile data" },
        { status: 400 },
      );
    }


    let {
      displayName,
      username,
      bio,
      location,
      avatarUrl,
      website,
      socials,
    } = parsedData.data || {}

    // username is optional here, but if provided, validate like onboarding
    // let normalizedUsername;

    if (username) {
      // let raw = String(username).trim()
      // if (raw.startsWith("@")) raw = raw.slice(1)
      // normalizedUsername = raw.toLowerCase()

      // const usernamePattern = /^[a-z0-9_]{3,20}$/

      // if (!usernamePattern.test(normalizedUsername)) {
      //   return NextResponse.json(
      //     {
      //       ok: false,
      //       message:
      //         "Username must be 3 to 20 characters, lowercase letters, numbers or underscores",
      //     },
      //     { status: 400 },
      //   )
      // }

      const existingProfile = await prisma.profile.findUnique({
        where: { username },
        select: { id: true },
      })

      if (existingProfile && existingProfile.id !== currentUser.id) {
        return NextResponse.json(
          { ok: false, message: "Username is already taken" },
          { status: 409 },
        )
      }
    }

    const profile = await prisma.profile.update({
      where: { id: currentUser.id },
      data: {
        displayName: displayName ?? undefined,
        username: username ?? undefined,
        bio: bio ?? undefined,
        location: location ?? undefined,
        avatarUrl: avatarUrl ?? undefined,
        website: website ?? undefined,
        socials: socials ?? undefined,
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
    })

    return NextResponse.json({ ok: true, profile })
  } catch (err) {
    console.error("Profile update error", err)
    return NextResponse.json(
      { ok: false, message: `Server error, ${err}`},
      { status: 500 },
    )
  }
}
