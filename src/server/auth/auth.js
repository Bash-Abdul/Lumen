import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/server/db/prisma";
import { verifyPassword } from "./password";
import { AuthLoginSchema } from "@/features/auth/validation/auth";

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
        const parsed = AuthLoginSchema.safeParse(credentials);

        if (!parsed.success) {
          const firstIssue = parsed.error.issues[0];
          throw new Error(firstIssue?.message || "Invalid credentials");
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            passwordHash: true,
            role: true,
            onboardingDone: true,
            profile: {
              select: {
                displayName: true,
                username: true,
              },
            },
          },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials");
        }

        const isValid = await verifyPassword(user.passwordHash, password);

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          onboardingDone: user.onboardingDone,
          name: user.profile?.displayName || null,
          username: user.profile?.username || null,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On first login, `user` is set from authorize()
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.onboardingDone = user.onboardingDone;
        token.username = user.username || null;
        token.name = user.name || null;
        token.lastFetch = Date.now(); // Initialize lastFetch
      }

      // ✅ Refresh user data on update trigger or periodically
      const shouldRefresh =
        trigger === "update" ||
        !token.lastFetch ||
        Date.now() - token.lastFetch > 5 * 60 * 1000; // Refresh every 5 mins

      if (shouldRefresh && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            id: true,
            email: true,
            role: true,
            onboardingDone: true,
            profile: {
              select: {
                displayName: true,
                username: true,
              },
            },
          },
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.onboardingDone = dbUser.onboardingDone;
          token.name = dbUser.profile?.displayName || null;
          token.username = dbUser.profile?.username || null;
          token.lastFetch = Date.now();
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (!token.id) {
        // anonymous / not logged in
        return session;
      }

      // ✅ Use data from JWT token (no DB query)
      session.user = {
        id: token.id,
        email: token.email,
        role: token.role || "USER",
        onboardingDone: Boolean(token.onboardingDone),
        name: token.name || null,
        username: token.username || null,
      };

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};




// import CredentialsProvider from "next-auth/providers/credentials";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import prisma from "@/server/db/prisma";
// // import bcrypt from "bcryptjs"
// import { verifyPassword } from "./password";
// import { AuthLoginSchema } from "@/features/auth/validation/auth";

// export const authOptions = {
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     CredentialsProvider({
//       name: "credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         const parsed = AuthLoginSchema.safeParse(credentials);

//     if (!parsed.success) {
//       const firstIssue = parsed.error.issues[0];
//       throw new Error(firstIssue?.message || "Invalid credentials");
//     }

//     const { email, password } = parsed.data;


//         // const email = credentials?.email?.trim().toLowerCase();
//         // const password = credentials?.password;

//         // if (!email || !password) {
//         //   throw new Error("Missing credentials");
//         // }

//         // tiny random delay, 100–250 ms
//         // await new Promise((r) =>
//         //   setTimeout(r, 100 + Math.floor(Math.random() * 150))
//         // );

//         const user = await prisma.user.findUnique({
//           where: { email },
//           select: {
//             id: true,
//             email: true,
//             passwordHash: true,
//             role: true,
//             onboardingDone: true,
//             profile: {
//               select: {
//                 displayName: true,
//                 username: true,
//               },
//             },
//           },
//         });

//         if (!user || !user.passwordHash) {
//           throw new Error("Invalid credentials");
//         }

//         // const isValid = await bcrypt.compare(password, user.password)
//         const isValid = await verifyPassword(user.passwordHash, password);

//         if (!isValid) {
//           throw new Error("Invalid credentials");
//         }

//         return {
//           id: user.id,
//           email: user.email,
//           // role: user.role,
//           // onboardingDone: user.onboardingDone,
//           // name: user.profile?.displayName || null,
//           // username: user.profile?.username || null,
//         };
//       },
//     }),
//   ],
//   session: {
//     strategy: "jwt",
//     maxAge: 7 * 60 * 60,
//   },
//   pages: {
//     signIn: "/login",
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       // On first login, `user` is set from authorize()
//       if (user) {
//         token.id = user.id;
//         token.email = user.email;
//         // token.role = user.role;
//         // token.onboardingDone = user.onboardingDone;
//         // token.username = user.username || null;
//         // token.name = user.name || null;
//       }

//          // ✅ Refresh user data on update trigger or periodically
//          const shouldRefresh = 
//          trigger === "update" || 
//          !token.lastFetch || 
//          Date.now() - token.lastFetch > 5 * 60 * 1000; // Refresh every 5 mins
 
//        if (shouldRefresh && token.id) {
//          const dbUser = await prisma.user.findUnique({
//            where: { id: token.id },
//            select: {
//              id: true,
//              email: true,
//              role: true,
//              onboardingDone: true,
//              profile: {
//                select: {
//                  displayName: true,
//                  username: true,
//                },
//              },
//            },
//          });
 
//          if (dbUser) {
//            token.role = dbUser.role;
//            token.onboardingDone = dbUser.onboardingDone;
//            token.name = dbUser.profile?.displayName || null;
//            token.username = dbUser.profile?.username || null;
//            token.lastFetch = Date.now();
//          }
//        }
 

//       // On later requests we just return the token as is
//       return token;
//     },

//     async session({ session, token }) {
//       // // Shape session.user based on the token
//       // session.user = {
//       //   id: token.id,
//       //   email: token.email,
//       //   name: token.name || null,
//       //   role: token.role || "USER",
//       //   onboardingDone: Boolean(token.onboardingDone),
//       //   username: token.username || null,
//       // };

//       // return session;

//         if (!token.id) {
//       // anonymous / not logged in
//       return session;
//     }

//     // // Fetch FRESH data from DB on each session call
//     // const dbUser = await prisma.user.findUnique({
//     //   where: { id: token.id },
//     //   select: {
//     //     id: true,
//     //     email: true,
//     //     role: true,
//     //     onboardingDone: true,
//     //     profile: {
//     //       select: {
//     //         displayName: true,
//     //         username: true,
//     //       },
//     //     },
//     //   },
//     // });

//     // if (!dbUser) {
//     //   // user deleted or missing
//     //   return session;
//     // }

//     session.user = {
//       id: token.id,
//         email: token.email,
//         role: token.role || "USER",
//         onboardingDone: Boolean(token.onboardingDone),
//         name: token.name || null,
//         username: token.username || null,
//     };

//     return session;
//     },
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   debug: process.env.NODE_ENV === "development",
// };
