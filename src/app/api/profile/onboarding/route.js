import { NextResponse } from "next/server"
import prisma from "@/server/db/prisma"
import { getCurrentUser } from "@/server/auth/auth-server"
import { OnboardingSchema } from "@/features/profile/validation/profile"

export async function POST(req) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { ok: false, message: "Not authenticated" },
        { status: 401 },
      )
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        onboardingDone: true,
      },
    })

    if (!dbUser) {
      return NextResponse.json(
        { ok: false, message: "User not found" },
        { status: 404 },
      )
    }

    if (dbUser.onboardingDone) {
      return NextResponse.json(
        { ok: false, message: "Onboarding already completed" },
        { status: 400 },
      )
    }

    const body = await req.json()

    const parsedData = OnboardingSchema.safeParse(body);

    if (!parsedData.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { ok: false, message: firstIssue?.message || "Invalid onboarding data" },
        { status: 400 },
      );
    }
    let { name, username, location, bio, avatar } = parsedData.data || {}

    // if (!name || !username) {
    //   return NextResponse.json(
    //     { ok: false, message: "Name and username are required" },
    //     { status: 400 },
    //   )
    // }

    // const displayName = String(name).trim()

    // let rawUsername = String(username).trim()
    // if (rawUsername.startsWith("@")) {
    //   rawUsername = rawUsername.slice(1)
    // }
    // const normalizedUsername = rawUsername.toLowerCase()

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

    if (existingProfile && existingProfile.id !== dbUser.id) {
      return NextResponse.json(
        { ok: false, message: "Username is already taken" },
        { status: 409 },
      )
    }

    // const safeBio = bio ? String(bio).trim() : null
    // const safeLocation = location ? String(location).trim() : null
    // const avatarUrl = avatar ? String(avatar).trim() : null

    // Keep profile + onboarding flag in sync
    const [profile] = await prisma.$transaction([
      prisma.profile.upsert({
        where: { id: dbUser.id },
        update: {
          displayName: name,
          username,
          bio: bio ?? null,
          location: location ?? null,
          avatarUrl: avatar ?? null,
        },
        create: {
          id: dbUser.id,
          displayName: name,
          username,
          bio: bio ?? null,
          location: location ?? null,
          avatarUrl: avatar ?? null,
        },
        select: {
          id: true,
          displayName: true,
          username: true,
          bio: true,
          location: true,
          avatarUrl: true,
        },
      }),
      prisma.user.update({
        where: { id: dbUser.id },
        data: { onboardingDone: true },
        select: { id: true },
      }),
    ])

    return NextResponse.json(
      {
        ok: true,
        message: "Onboarding completed",
        profile,
      },
      { status: 200 },
    )
  } catch (err) {
    console.error("Onboarding error", err)
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 },
    )
  }
}
