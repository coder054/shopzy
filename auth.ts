import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const config = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  adapter: PrismaAdapter(prisma),

  providers: [
    CredentialsProvider({
      credentials: {
        email: {
          type: "email",
        },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (credentials == null) return null;

        // Find user in database
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });
        // Check if user exists and password is correct
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password,
          );
          // If password is correct, return user object
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        // If user doesn't exist or password is incorrect, return null
        return null;
      },
    }),
  ],

  callbacks: {
    async session({ session, user, trigger, token }: any) {
      session.user.id = token.sub;
      session.user.name = token.name;
      session.user.role = token.role;
      if (trigger === "update") {
        session.user.name = user.name;
      }
      return session;
    },
    async jwt(params: any) {
      const { trigger, session, token, user } = params;
      if (user) {
        token.id = user.id;
        token.role = user.role;

        if (user.name === "NO_NAME") {
          token.name = user.email?.split("@")[0];

          // update the user in the database with the new name
          await prisma.user.update({
            where: { id: user.id },
            data: {
              name: token.name,
            },
          });
        }
        if (trigger === "signIn" || trigger === "signUp") {
          const cookiesObj = await cookies();
          const sessionCartId = cookiesObj.get("sessionCartId")?.value;
          if (sessionCartId) {
            const sessionCart = await prisma.cart.findFirst({
              where: { sessionCartId },
            });
            if (sessionCart) {
              // override any existing user cart
              await prisma.cart.deleteMany({
                where: { userId: user.id },
              });

              // assign the guest cart to the logged-in user
              await prisma.cart.update({
                where: {
                  id: sessionCart.id,
                },
                data: {
                  userId: user.id,
                },
              });
            }
          }
        }
      }

      // handle session updates (eg: name change)
      if (session?.user?.name && trigger === "update") {
        token.name = session.user.name;
      }

      return token;
    },
    // authorized({ request, auth }: any) {
    //   console.log("aaa", { request, auth });
    //   // check for cart cookie
    //   if (!request?.cookies?.get("sessionCartId")) {
    //     // generate cart cookie
    //     const sessionCartId = crypto.randomUUID();

    //     // clone the request header
    //     const newRequestHeaders = new Headers(request.headers);

    //     // create a new response and add the new headers
    //     const response = NextResponse.next({
    //       request: {
    //         headers: newRequestHeaders,
    //       },
    //     });

    //     // set the newly generated sessionCartId in the response cookies
    //     response.cookies.set("sessionCartId", sessionCartId);
    //     return response;
    //   } else {
    //     return true;
    //   }
    // },

    authorized({ request, auth }: any) {
      console.log("aaa authorized");
      const protectedPaths = [
        /\/shipping-address/,
        /\/payment-method/,
        /\/place-order/,
        /\/profile/,
        /\/user\/(.*)/,
        /\/order\/(.*)/,
        /\/admin/,
      ];
      const { pathname } = request.nextUrl;
      if (!auth && protectedPaths.some((p) => p.test(pathname))) {
        return false;
      }
      if (!request.cookies.get("sessionCartId")) {
        // Check for cart cookie
        // Generate cart cookie
        const sessionCartId = crypto.randomUUID();

        // Clone the request headers
        const newRequestHeaders = new Headers(request.headers);

        // Create a new response and add the new headers
        const response = NextResponse.next({
          request: {
            headers: newRequestHeaders,
          },
        });

        // Set the newly generated sessionCartId in the response cookies
        response.cookies.set("sessionCartId", sessionCartId);

        // Return the response with the sessionCartId set
        return response;
      } else {
        return true;
      }
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
