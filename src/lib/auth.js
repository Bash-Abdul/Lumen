import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "./prisma"
// import bcrypt from "bcryptjs"
import { verifyPassword } from "./password"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase()
        const password = credentials?.password

        if (!email || !password) {
          throw new Error("Missing credentials")
        }

        // tiny random delay, 100–250 ms
        await new Promise((r) =>
          setTimeout(r, 100 + Math.floor(Math.random() * 150)),
        )

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            passwordHash: true,
          },
        })

        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials")
        }

        // const isValid = await bcrypt.compare(password, user.password)
        const isValid = await verifyPassword(user.passwordHash, password)

        if (!isValid) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
