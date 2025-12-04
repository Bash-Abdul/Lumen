import argon2 from "argon2"

export async function hashPassword(plain) {
  return argon2.hash(plain, {
    // These are good defaults, you can tweak later
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1,
  })
}

export async function verifyPassword(hash, plain) {
  return argon2.verify(hash, plain)
}
