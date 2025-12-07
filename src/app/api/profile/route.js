import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-server"

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
    let {
      displayName,
      username,
      bio,
      location,
      avatarUrl,
      website,
      socials,
    } = body || {}

    // username is optional here, but if provided, validate like onboarding
    let normalizedUsername;

    if (username) {
      let raw = String(username).trim()
      if (raw.startsWith("@")) raw = raw.slice(1)
      normalizedUsername = raw.toLowerCase()

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
        //  displayName:
        //   displayName === undefined ? undefined : String(displayName).trim(),
        displayName: displayName ? String(displayName).trim() : undefined,
        username: normalizedUsername ?? undefined,
        bio: bio === undefined ? undefined : String(bio).trim(),
        location: location === undefined ? undefined : String(location).trim(),
        avatarUrl:
          avatarUrl === undefined ? undefined : String(avatarUrl).trim(),
        website: website === undefined ? undefined : String(website).trim(),
        socials: socials === undefined ? undefined : socials,
      },
    })

    return NextResponse.json({ ok: true, profile })
  } catch (err) {
    console.error("Profile update error", err)
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 },
    )
  }
}
