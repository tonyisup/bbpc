import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { env } from "@/env.mjs";
import { db } from "@/server/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      isAdmin: boolean;
    };
  }

  interface User {
    id: string;
    isAdmin?: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        // Get user roles
        const userRoles = await db.userRole.findMany({
          where: { userId: user.id },
          include: { role: true },
        });
        
        // Check if user has admin role
        const isAdmin = userRoles.some(ur => ur.role.admin);

        session.user = {
          ...session.user,
          id: user.id,
          isAdmin,
        };
      }
      return session;
    },
  },
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
};

export const getServerAuthSession = () => getServerSession(authOptions); 