import jwt from "jsonwebtoken";
import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import backendClient from "./backend-client";

export const secret = process.env.NEXTAUTH_SECRET!;

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Solana",
      credentials: {
        message: {
          label: "Message",
          type: "text",
        },
        signature: {
          label: "Signature",
          type: "text",
        },
      },
      async authorize(credentials, req) {
        try {
          const csrfToken = await getCsrfToken({ req: { ...req, body: null } });

          const { data } = await backendClient.post<{
            token: string;
          } | null>("/auth/sign-in", {
            message: credentials?.message,
            signature: credentials?.signature,
            csrfToken,
          });

          if (!data || !data.token) {
            return null;
          }

          const payload = jwt.decode(data.token) as any;
          console.log({ payload });
          return {
            id: payload.id,
          };
        } catch (e) {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      // @ts-ignore
      session.publicKey = token.sub;
      if (session.user) {
        session.user.pubkey = token.sub;
        session.user.image = `https://ui-avatars.com/api/?name=${token.sub}&background=random`;
      }
      return session;
    },
  },
} satisfies NextAuthOptions;

export const handler = NextAuth(authOptions);
