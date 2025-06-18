import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const syllabusRouter = createTRPCRouter({
  add: protectedProcedure
    .input(z.object({
      userId: z.string(),
      movieId: z.string(),
      order: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.syllabus.create({
        data: {
          userId: input.userId,
          movieId: input.movieId,
          order: input.order
        },
        include: {
          Movie: true,
          Assignment: {
            include: {
              Episode: true
            }
          }
        }
      });
    }),

  remove: protectedProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.syllabus.delete({
        where: { id: input.id }
      });
      return input.id;
    }),

  reorder: protectedProcedure
    .input(z.object({
      userId: z.string(),
      syllabus: z.array(z.object({
        id: z.string(),
        order: z.number()
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      const updates = input.syllabus.map(item => 
        ctx.db.syllabus.update({
          where: { id: item.id },
          data: { order: item.order },
          include: { Movie: true, Assignment: { include: { Episode: true } } }
        })
      );
      
      const results = await ctx.db.$transaction(updates);
      return results;
    }),

  updateNotes: protectedProcedure
    .input(z.object({
      id: z.string(),
      notes: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.syllabus.update({
        where: { id: input.id },
        data: { notes: input.notes },
        include: {
          Movie: true,
          Assignment: {
            include: {
              Episode: true
            }
          }
        }
      });
    })
}); 