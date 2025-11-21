import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth, currentUser } from "@clerk/nextjs/server";

import { db } from "@/server/db";
import { tmdb } from "../tmdb/client";
import { yt } from "../yt/client";

// Mock Session interface to match previous NextAuth structure where needed,
// or better, define what we actually need.
// The previous session had: user: { id, name, email, image, isAdmin }
interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAdmin: boolean;
}

interface Session {
  user: SessionUser | null;
}

interface CreateContextOptions {
  session: Session | null;
  userId: string | null;
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    userId: opts.userId,
    db,
    tmdb,
    yt,
  };
};

export const createTRPCContext = async (opts?: CreateNextContextOptions) => {
  const { userId } = auth();
  let session: Session | null = null;

  if (userId) {
    // We need to fetch the user from our database to get the 'isAdmin' flag and other details
    // that might be stored locally.
    // Assuming we are syncing or just using the DB user.
    // Note: In a real migration, we'd ensure Clerk users are in the local DB.
    // Here, we'll try to find the user.

    // If you are strictly using Clerk, you might store roles in Clerk metadata.
    // But the existing app uses a `User` table with relations.
    // So we must ensure a User record exists.

    // Check if user exists in DB
    let user = await db.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } }
    });

    // If user doesn't exist, and we have a valid Clerk ID, we might want to create them
    // or just let them be "unauthorized" for DB operations until synced.
    // For this "switch", I'll assume we might need to create them if they don't exist
    // to maintain functionality for new Clerk users.
    if (!user) {
      // Fetch details from Clerk to populate
      const clerkUser = await currentUser();
      if (clerkUser) {
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        const name = `${clerkUser.firstName} ${clerkUser.lastName}`.trim();
        const image = clerkUser.imageUrl;

        try {
          user = await db.user.create({
            data: {
              id: userId, // Use Clerk ID as primary key
              email: email,
              name: name || "User",
              image: image,
              // Add default roles if needed?
            },
            include: { roles: { include: { role: true } } }
          });
        } catch (e) {
           // Handle race condition or other errors
           console.error("Failed to create user in trpc context", e);
        }
      }
    }

    if (user) {
      const isAdmin = user.roles.some(ur => ur.role.admin);
      session = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          isAdmin: isAdmin,
        }
      };
    }
  }

  return createInnerTRPCContext({
    session,
    userId,
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user || !ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
      userId: ctx.userId,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user?.isAdmin) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Admin access required" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const adminProcedure = t.procedure.use(enforceUserIsAdmin);
