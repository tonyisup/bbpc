import { Prisma, type PrismaClient } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  buildDenseDescendingOrder,
  insertIntoCanonicalSyllabus,
  syllabusInsertPositions,
} from "@/lib/syllabus";

/** One round-trip instead of N Prisma updates (critical for large syllabi on SQL Server). */
async function applySyllabusOrderUpdates(
  db: Pick<PrismaClient, "$executeRaw">,
  userId: string,
  orderUpdates: readonly { id: string; order: number }[],
) {
  if (orderUpdates.length === 0) {
    return;
  }

  const caseBranches = Prisma.join(
    orderUpdates.map((item) => Prisma.sql`WHEN ${item.id} THEN ${item.order}`),
    " ",
  );
  const idList = Prisma.join(orderUpdates.map((item) => item.id));

  await db.$executeRaw`
    UPDATE [dbo].[Syllabus]
    SET [order] = CASE [id] ${caseBranches} END
    WHERE [userId] = ${userId} AND [id] IN (${idList})
  `;
}

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
        // Serialize per-user syllabus changes (SQL Server: UPDLOCK; Postgres would use FOR UPDATE)
        await tx.$queryRaw`SELECT id FROM [User] WITH (UPDLOCK, ROWLOCK) WHERE id = ${userId}`;

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

        await applySyllabusOrderUpdates(tx, userId, orderUpdates);

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

      await applySyllabusOrderUpdates(ctx.db, userId, changedItems);
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