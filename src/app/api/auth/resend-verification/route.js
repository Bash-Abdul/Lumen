import { NextResponse } from "next/server";
import prisma from "@/server/db/prisma";
// import { createVerificationToken } from "@/server/services/token-manager";
import { createVerificationToken } from "@/server/services/token-manager";
// import { sendVerificationEmail } from "@/server/services/email";
import { sendVerificationEmail } from "@/server/services/email";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { ok: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, emailVerified: true },
    });

    if (!user) {
      // Don't reveal if user exists or not (security)
      return NextResponse.json(
        {
          ok: true,
          message: "If an account exists, verification email has been sent.",
        },
        { status: 200 }
      );
    }

    // If already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { ok: false, message: "Email is already verified" },
        { status: 400 }
      );
    }

    // Generate new token
    const token = await createVerificationToken(email);

    // Send verification email (or log to console)
    const emailResult = await sendVerificationEmail(email, token);

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
      return NextResponse.json(
        { ok: false, message: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Verification email sent. Please check your email (or console).",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { ok: false, error: "An error occurred" },
      { status: 500 }
    );
  }
}