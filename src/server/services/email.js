// server/services/email.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Your "from" email - must be verified in Resend dashboard
// For testing, use: onboarding@resend.dev
// For production, use your domain: noreply@yourdomain.com
const FROM_EMAIL = process.env.EMAIL_FROM || "onboarding@resend.dev";

// Your app name and URL
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "LUMEN PHOTOS";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Toggle between real emails and console logging
const USE_REAL_EMAILS = process.env.USE_REAL_EMAILS === "true";

/**
 * Send email verification link
 */
export async function sendVerificationEmail(email, token) {
  const verificationUrl = `${APP_URL}/verify-email?token=${token}`;


    // Development mode: Log to console
    if (!USE_REAL_EMAILS) {
        console.log("\n" + "=".repeat(80));
        console.log("📧 EMAIL VERIFICATION LINK (Copy this to your browser):");
        console.log("=".repeat(80));
        console.log(`To: ${email}`);
        console.log(`Link: ${verificationUrl}`);
        console.log("=".repeat(80) + "\n");
        return { success: true };
      }
    

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Verify your ${APP_NAME} account`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ${APP_NAME}!</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                Thanks for signing up! Please verify your email address to get started.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="font-size: 12px; color: #999; word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
                ${verificationUrl}
              </p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #999;">
                This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
    });



    return { success: true };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send password reset link
 */
export async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

    // Development mode: Log to console
    if (!USE_REAL_EMAILS) {
        console.log("\n" + "=".repeat(80));
        console.log("🔐 PASSWORD RESET LINK (Copy this to your browser):");
        console.log("=".repeat(80));
        console.log(`To: ${email}`);
        console.log(`Link: ${resetUrl}`);
        console.log("=".repeat(80) + "\n");
        return { success: true };
      }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Reset your ${APP_NAME} password`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                We received a request to reset your password. Click the button below to choose a new password.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background: #f5576c; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="font-size: 12px; color: #999; word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
                ${resetUrl}
              </p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #999;">
                This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return { success: false, error: error.message };
  }
}