import { NextResponse } from "next/server";
import prisma from "@/server/db/prisma";
import { verifyToken, deleteToken } from "@/server/services/token-manager";

export async function POST(req) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { ok: false, message: "Token is required" },
        { status: 400 }
      );
    }

    // Verify token and get email
    const email = await verifyToken(token);

    if (!email) {
      return NextResponse.json(
        { ok: false, message: "Invalid or expired verification link" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { ok: true, message: "Email already verified" },
        { status: 200 }
      );
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(), // Set to current timestamp
      },
    });

    // Delete the used token
    await deleteToken(token);

    return NextResponse.json(
      {
        ok: true,
        message: "Email verified successfully! You can now log in.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { ok: false, error: "An error occurred during verification" },
      { status: 500 }
    );
  }
}