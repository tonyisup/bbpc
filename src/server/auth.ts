import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { env } from "@/env.mjs";
import { db } from "@/server/db";
import { calculateUserPoints } from "@/utils/points";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: DefaultSession["user"] & {
      id: string;
      isAdmin: boolean;
      points?: number;
      name?: string;
      image?: string;
      isImpersonating?: boolean;
      realUser?: {
        id: string;
        name?: string;
        image?: string;
      };
    };
  }

  interface User {
    id: string;
    isAdmin?: boolean;
    points?: number;
    name?: string;
    image?: string;
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    signIn: async ({ user, account, profile }) => {
      console.log('Sign in callback:', { user, account, profile });
      return true;
    },
    jwt: async ({ token, user, account, profile }) => {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        token.points = user.points;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    session: async ({ session, user }) => {
      if (session.user) {
        // Get original user roles
        const userRoles = await db.userRole.findMany({
          where: { userId: user.id },
          include: { role: true },
        });

        // Check if user has admin role
        const isAdmin = userRoles.some(ur => ur.role.admin);

        // Get the user from DB to check for impersonation
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { impersonatedUserId: true, name: true, image: true }
        });

        if (isAdmin && dbUser?.impersonatedUserId) {
          const impersonatedUser = await db.user.findUnique({
            where: { id: dbUser.impersonatedUserId },
            select: { id: true, name: true, image: true, email: true }
          });

          if (impersonatedUser) {
            session.user.id = impersonatedUser.id;
            session.user.name = impersonatedUser.name ?? "";
            session.user.email = impersonatedUser.email ?? "";
            session.user.image = impersonatedUser.image ?? "";
            session.user.isAdmin = false; // Impersonated user is not admin
            session.user.isImpersonating = true;
            session.user.realUser = {
              id: user.id,
              name: dbUser.name ?? "",
              image: dbUser.image ?? "",
            };
            session.user.points = await calculateUserPoints(db, impersonatedUser.email ?? "");
            return session;
          }
        }

        session.user.id = user.id;
        session.user.isAdmin = isAdmin;
        session.user.isImpersonating = false;
        session.user.points = await calculateUserPoints(db, user.email ?? "");
      }
      return session;
    },
  },
  adapter: PrismaAdapter(db),
  providers: [
    EmailProvider({
      server: {
        host: env.EMAIL_SERVER_HOST,
        port: env.EMAIL_SERVER_PORT,
        auth: {
          user: env.EMAIL_SERVER_USER,
          pass: env.EMAIL_SERVER_PASSWORD
        }
      },
      from: env.EMAIL_FROM,
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/userinfo.profile"
        }
      },
      profile(profile) {
        console.log('Google profile:', profile);
        return {
          id: profile.sub,
          name: profile.name ?? "",
          email: profile.email ?? "",
          image: profile.picture ?? "",
        };
      },
    }),
  ],
};

export const getServerAuthSession = () => getServerSession(authOptions); 