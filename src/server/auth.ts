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
    user?: DefaultSession["user"] & {
      id: string;
      isAdmin: boolean;
      points?: number;
      name?: string;
      image?: string;
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
        // Get user roles
        const userRoles = await db.userRole.findMany({
          where: { userId: user.id },
          include: { role: true },
        });
        
        // Check if user has admin role
        const isAdmin = userRoles.some(ur => ur.role.admin);

        // Get user points from database
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { 
            points: true,
            name: true,
            image: true,
          }
        });
        
        user.points = dbUser?.points?.toNumber() ?? undefined;
        session.user = {
          ...session.user,
          id: user.id,
          isAdmin,  
          name: dbUser?.name ?? undefined,
          image: dbUser?.image ?? undefined,
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
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),

		// EmailProvider({
		// 	server: {
		// 		host: env.EMAIL_SERVER_HOST,
		// 		port: env.EMAIL_SERVER_PORT,
		// 		auth: {
		// 			user: env.EMAIL_SERVER_USER,
		// 			pass: env.EMAIL_SERVER_PASSWORD
		// 		},
		// 		secure: true
		// 	},
		// 	from: env.EMAIL_FROM,
		// }),
  ],
};

export const getServerAuthSession = () => getServerSession(authOptions); 