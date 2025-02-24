import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Role } from "@prisma/client";

import { env } from "@/env.mjs";
import { db } from "@/server/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: user.role,
      },
    }),
  },
  adapter: PrismaAdapter(db),
  providers: [
    // Add providers here
  ],
};

export const getServerAuthSession = () => getServerSession(authOptions); 