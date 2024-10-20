import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";

export const authRouter = router({
  getSession: publicProcedure
    .query(({ ctx }) => {
      return ctx.session;
    }),
  getSecretMessage: protectedProcedure
    .query(() => {
      return "you can now see this secret message!";
    }),
  isAdmin: protectedProcedure
    .query(async ({ ctx }) => {
      const role = await ctx.prisma.userRole.findFirst({
        where: {
          userId: ctx.session.user.id,
        },
        include: {
          role: {
            select: {
              admin: true,
            }
          }
        }
      })
      return role?.role.admin;
    }),
  verifyRecaptcha: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const secretKey = process.env.RECAPTCHA_SECRET_KEY;
      const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${input.token}`;

      const response = await fetch(verificationUrl, { method: 'POST' });
      const data = await response.json();

      return { success: data.success };
    }),
  getPhoneNumber: publicProcedure
    .query(async () => {
      // Retrieve the phone number from the environment variable
      const phoneNumber = process.env.PHONE_NUMBER;

      // If the phone number is not set in the environment, return null
      if (!phoneNumber) {
        return null;
      }

      // Return the phone number from the environment
      return phoneNumber;
    })
});
