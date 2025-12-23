// server/services/token-manager.js
import crypto from "crypto";
import prisma from "@/server/db/prisma";

/**
 * Generate a random secure token
 */
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create email verification token
 * @param {string} email - User's email
 * @returns {Promise<string>} - The generated token
 */
export async function createVerificationToken(email) {
  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  const token = generateToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return token;
}

/**
 * Create password reset token
 * @param {string} email - User's email
 * @returns {Promise<string>} - The generated token
 */
export async function createPasswordResetToken(email) {
  // Delete any existing password reset tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { 
      identifier: email,
    },
  });

  const token = generateToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour (shorter for security)

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return token;
}

/**
 * Verify a token and get the email
 * @param {string} token - The token to verify
 * @returns {Promise<string|null>} - Email if valid, null if invalid/expired
 */
export async function verifyToken(token) {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    return null; // Token doesn't exist
  }

  // Check if expired
  if (verificationToken.expires < new Date()) {
    // Delete expired token
    await prisma.verificationToken.delete({
      where: { token },
    });
    return null;
  }

  return verificationToken.identifier; // Return the email
}

/**
 * Delete a token after it's been used
 * @param {string} token - The token to delete
 */
export async function deleteToken(token) {
  await prisma.verificationToken.delete({
    where: { token },
  }).catch(() => {
    // Token might already be deleted, ignore error
  });
}

/**
 * Check if user's email is verified
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
export async function isEmailVerified(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true },
  });

  return !!user?.emailVerified;
}