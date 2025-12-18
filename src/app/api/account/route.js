import { NextResponse } from "next/server"
import prisma from "@/server/db/prisma"
import { getCurrentUser } from "@/server/auth/auth-server"
import bcrypt from "bcryptjs"

export async function GET() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return NextResponse.json(
      { ok: false, message: "Not authenticated" },
      { status: 401 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ ok: true, user })
}

export async function PATCH(req) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { ok: false, message: "Not authenticated" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { email, currentPassword, newPassword } = body || {}

    const wantsEmailChange = !!email
    const wantsPasswordChange = !!newPassword

    if (!wantsEmailChange && !wantsPasswordChange) {
      return NextResponse.json(
        {
          ok: false,
          message: "Nothing to update. Provide email or newPassword.",
        },
        { status: 400 }
      )
    }

    // fetch user once
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
    })

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "User not found" },
        { status: 404 }
      )
    }

    // for sensitive changes, force password check (you can relax this later if you want)
    if (!currentPassword) {
      return NextResponse.json(
        { ok: false, message: "Current password is required" },
        { status: 400 }
      )
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { ok: false, message: "Current password is incorrect" },
        { status: 400 }
      )
    }

    const updateData = {}

    if (wantsEmailChange) {
      updateData.email = email
    }

    if (wantsPasswordChange) {
      const newHash = await bcrypt.hash(newPassword, 10)
      updateData.passwordHash = newHash
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: { id: true, email: true },
    })

    return NextResponse.json({
      ok: true,
      user: updatedUser,
      message: "Account updated",
    })
  } catch (err) {
    console.error("Account update error", err)
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json(
        { ok: false, message: "Not authenticated" },
        { status: 401 }
      )
    }

    // if there is a profile row with same id, delete it first
    await prisma.$transaction([
      prisma.profile.deleteMany({
        where: { id: currentUser.id },
      }),
      prisma.user.delete({
        where: { id: currentUser.id },
      }),
    ])

    // you might also want to sign the user out on the client after this

    return NextResponse.json({
      ok: true,
      message: "Account deleted",
    })
  } catch (err) {
    console.error("Account delete error", err)
    return NextResponse.json(
      { ok: false, message: "Server error" },
      { status: 500 }
    )
  }
}
