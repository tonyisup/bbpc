import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  buildDenseDescendingOrder,
  insertIntoCanonicalSyllabus,
  syllabusInsertPositions,
} from "@/lib/syllabus";

export const syllabusRouter = createTRPCRouter({
  add: protectedProcedure
    .input(z.object({
      movieId: z.string(),
      position: z.enum(syllabusInsertPositions).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const position = input.position ?? "END";

      const createdItemId = await ctx.db.$transaction(async (tx) => {
        // Acquire per-user lock by updating the user row with FOR UPDATE
        await tx.user.findUnique({
          where: { id: userId },
          select: { id: true },
        });

        const existingItems = await tx.syllabus.findMany({
          where: {
            userId: userId,
          },
          orderBy: {
            order: "desc",
          },
        });

        const createdItem = await tx.syllabus.create({
          data: {
            userId: userId,
            movieId: input.movieId,
            order: 0,
          },
        });

        const orderedItems = insertIntoCanonicalSyllabus(existingItems, createdItem, position);
        const orderUpdates = buildDenseDescendingOrder(orderedItems);

        for (const item of orderUpdates) {
          await tx.syllabus.update({
            where: { id: item.id },
            data: {
              order: item.order,
            },
          });
        }

        return createdItem.id;
      });

      const insertedItem = await ctx.db.syllabus.findUnique({
        where: {
          id: createdItemId,
        },
        include: {
          movie: true,
          assignment: {
            include: {
              episode: true,
            },
          },
        },
      });

      if (!insertedItem) {
        throw new Error("Failed to fetch inserted syllabus item");
      }

      return insertedItem;
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
      syllabus: z.array(z.object({
        id: z.string(),
        order: z.number()
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      if (input.syllabus.length === 0) {
        return { success: true };
      }

      const currentOrders = await ctx.db.syllabus.findMany({
        where: {
          userId: userId,
          id: {
            in: input.syllabus.map((item) => item.id),
          },
        },
        select: {
          id: true,
          order: true,
        },
      });
      const currentOrderById = new Map(currentOrders.map((item) => [item.id, item.order]));
      const changedItems = input.syllabus.filter((item) => currentOrderById.get(item.id) !== item.order);

      if (changedItems.length === 0) {
        return { success: true };
      }

      const updates = changedItems.map((item) =>
        ctx.db.syllabus.updateMany({
          where: {
            id: item.id,
            userId: userId,
          },
          data: { order: item.order },
        }),
      );

      await ctx.db.$transaction(updates);
      return { success: true };
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
          movie: true,
          assignment: {
            include: {
              episode: true
            }
          }
        }
      });
    })
}); 