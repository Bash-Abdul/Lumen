import { NextResponse } from "next/server";
import prisma from "@/server/db/prisma";
import { hashPassword } from "@/server/auth/password";
import { getCurrentUser } from "@/server/auth/auth-server";
import { AuthSignupSchema } from "@/features/auth/validation/auth";
import { createVerificationToken } from "@/server/services/token-manager";
import { sendVerificationEmail } from "@/server/services/email";
import { signupRateLimiter, getClientIp, formatRateLimitReset } from "@/server/services/rate-limiter/rate-limiter";

export async function POST(req) {
    
    
 try {
      // ✅ Rate limit check
      const ip = getClientIp(req);
      const { success, limit, reset, remaining } = await signupRateLimiter.limit(ip);
  
      if (!success) {
        const resetTime = formatRateLimitReset(reset - Date.now());
        
        return NextResponse.json(
          {
            ok: false,
            message: `Too many signup attempts. Please try again in ${resetTime}.`,
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": new Date(reset).toISOString(),
            },
          }
        );
      }
      
    const currentUser = await getCurrentUser();

    // if user is already logged in, prevent registeration
     if (currentUser) {
        return NextResponse.json({error: 'User is already logged in'}, {status: 400});
    }

    const body = await req.json();

    const parsedData = AuthSignupSchema.safeParse(body);

    if (!parsedData.success) {
        const firstIssue = parsedData.error.issues[0];
        return NextResponse.json(
          { ok: false, message: firstIssue?.message || "Invalid signup data" },
          { status: 400 },
        );
    }



    // destructure required field from parsedData
    const {email, password} = parsedData.data;



    // check for missing fields || fields that were'nt inputted and return error if true
    // if (!email || !password) {
    //     return NextResponse.json({message: 'Missing required field'}, {status: 400})
    // }


    // convert inputted email into lower case
    // const emailToLower = String(email).trim().toLowerCase();

    // check on password to make sure password must at leaste be Password must be 8+ chars, include uppercase, lowercase, number and special char
    // const strongPasswordCheck = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    // if (!strongPasswordCheck.test(password)){
    //     return NextResponse.json({message: 'Password must be 8+ chars, include uppercase, lowercase, number and special char'}, {status: 400})
    // }

    // check if user already exists in DB using prisma
    const existingUser = await prisma.user.findUnique(
        {
            where: {email},
            select: {id:true}
        }
    );

    // if user exists return error
    if (existingUser){
        return NextResponse.json({message: 'User already exists'}, {status: 409})
    }

     // If user exists but email NOT verified, allow re-signup (resend verification)
     if (existingUser && !existingUser.emailVerified) {
        // Generate new verification token
        const token = await createVerificationToken(email);
  
        // Send verification email (or log to console)
        await sendVerificationEmail(email, token);
  
        return NextResponse.json(
          {
            ok: true,
            message: "Verification email resent. Please check your email (or console).",
            requiresVerification: true,
          },
          { status: 200 }
        );
      }

      
    // hash/secure passwword by turning typed in password into jargons in db
    const hashedPassword = await hashPassword(password)

    // create user in db if existing user check becomes false
    const user = await prisma.user.create(
       {
        data: {email, passwordHash: hashedPassword, emailVerified: null},
        select: { id: true, email: true} 
       }
    )

     // ✅ Generate verification token
     const token = await createVerificationToken(email);

     // ✅ Send verification email (or log to console in dev mode)
     const emailResult = await sendVerificationEmail(email, token);
 
     if (!emailResult.success) {
       console.error("Failed to send verification email:", emailResult.error);
       // Don't fail signup if email fails - user can request resend later
     }


    // note: {select: { id: true, name: true, email: true} } over return NextResponse.json({ id: user.id, email: user.email }) as the former only returns selected fields while the latter retur

    return NextResponse.json({ok: true, message: 'User created successfully', user, requiresVerification: true,}, {status: 201});
 } catch (error) {
    console.error('error occured', error);
    return NextResponse.json({error: `Error occured ${error}` }, {status: 500});
 }
}
