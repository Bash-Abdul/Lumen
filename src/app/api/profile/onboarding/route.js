import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-server"

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
    let { name, username, location, bio, avatar } = body || {}

    if (!name || !username) {
      return NextResponse.json(
        { ok: false, message: "Name and username are required" },
        { status: 400 },
      )
    }

    const displayName = String(name).trim()

    let rawUsername = String(username).trim()
    if (rawUsername.startsWith("@")) {
      rawUsername = rawUsername.slice(1)
    }
    const normalizedUsername = rawUsername.toLowerCase()

    const usernamePattern = /^[a-z0-9_]{3,20}$/

    if (!usernamePattern.test(normalizedUsername)) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Username must be 3 to 20 characters, lowercase letters, numbers or underscores",
        },
        { status: 400 },
      )
    }

    const existingProfile = await prisma.profile.findUnique({
      where: { username: normalizedUsername },
      select: { id: true },
    })

    if (existingProfile && existingProfile.id !== dbUser.id) {
      return NextResponse.json(
        { ok: false, message: "Username is already taken" },
        { status: 409 },
      )
    }

    const safeBio = bio ? String(bio).trim() : null
    const safeLocation = location ? String(location).trim() : null
    const avatarUrl = avatar ? String(avatar).trim() : null

    // Keep profile + onboarding flag in sync
    const [profile] = await prisma.$transaction([
      prisma.profile.upsert({
        where: { id: dbUser.id },
        update: {
          displayName,
          username: normalizedUsername,
          bio: safeBio,
          location: safeLocation,
          avatarUrl,
        },
        create: {
          id: dbUser.id,
          displayName,
          username: normalizedUsername,
          bio: safeBio,
          location: safeLocation,
          avatarUrl,
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
