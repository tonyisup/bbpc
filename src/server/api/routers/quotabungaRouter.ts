import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getCurrentSeasonID } from "@/utils/points";

const sourceTypeSchema = z.enum(["MOVIE", "TV", "OTHER"]);

const clipUrlSchema = z
  .string()
  .trim()
  .max(2000)
  .refine((value) => {
    if (!value) return true;

    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Clip URL must be a valid http or https URL");

const submissionSchema = z.object({
  quoteText: z.string().trim().min(1, "Quote is required").max(2000),
  sourceTitle: z.string().trim().min(1, "Movie or show is required").max(500),
  sourceType: sourceTypeSchema,
  clipUrl: clipUrlSchema.optional().default(""),
  clipStartSeconds: z.number().int().min(0).max(86400).nullable().optional(),
  listenerNotes: z.string().trim().max(1000).optional().default(""),
});

const findSubmissionEpisode = async (db: Parameters<typeof getCurrentSeasonID>[0]) => {
  return db.episode.findFirst({
    where: { status: { in: ["next", "recording"] } },
    orderBy: { number: "desc" },
    select: { id: true, number: true, title: true, status: true },
  });
};

export const quotabungaRouter = createTRPCRouter({
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const episode = await findSubmissionEpisode(ctx.db);

    if (!episode) {
      return { episode: null, isOpen: false, submission: null };
    }

    const submission = await ctx.db.quoteSubmission.findUnique({
      where: {
        episodeId_userId: {
          episodeId: episode.id,
          userId: ctx.session.user.id,
        },
      },
    });

    return {
      episode,
      isOpen: episode.status === "next",
      submission,
    };
  }),

  submit: protectedProcedure
    .input(submissionSchema)
    .mutation(async ({ ctx, input }) => {
      const episode = await ctx.db.episode.findFirst({
        where: { status: "next" },
        orderBy: { number: "desc" },
        select: { id: true, number: true },
      });

      if (!episode) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Quotabunga submissions are currently closed.",
        });
      }

      const seasonId = await getCurrentSeasonID(ctx.db);
      if (!seasonId) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "There is no active game season.",
        });
      }

      const existing = await ctx.db.quoteSubmission.findUnique({
        where: {
          episodeId_userId: {
            episodeId: episode.id,
            userId: ctx.session.user.id,
          },
        },
        select: { pointId: true },
      });

      if (existing?.pointId) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This submission has already been scored and cannot be edited.",
        });
      }

      const data = {
        quoteText: input.quoteText,
        sourceTitle: input.sourceTitle,
        sourceType: input.sourceType,
        clipUrl: input.clipUrl || null,
        clipStartSeconds: input.clipStartSeconds ?? null,
        listenerNotes: input.listenerNotes || null,
        status: "SUBMITTED",
        bracketOrder: null,
        placement: null,
      };

      return ctx.db.quoteSubmission.upsert({
        where: {
          episodeId_userId: {
            episodeId: episode.id,
            userId: ctx.session.user.id,
          },
        },
        create: {
          ...data,
          episodeId: episode.id,
          seasonId,
          userId: ctx.session.user.id,
        },
        update: data,
      });
    }),

  withdraw: protectedProcedure.mutation(async ({ ctx }) => {
    const episode = await ctx.db.episode.findFirst({
      where: { status: "next" },
      orderBy: { number: "desc" },
      select: { id: true },
    });

    if (!episode) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Quotabunga submissions are currently locked.",
      });
    }

    const submission = await ctx.db.quoteSubmission.findUnique({
      where: {
        episodeId_userId: {
          episodeId: episode.id,
          userId: ctx.session.user.id,
        },
      },
      select: { id: true, pointId: true },
    });

    if (!submission) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Submission not found." });
    }

    if (submission.pointId) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "This submission has already been scored and cannot be withdrawn.",
      });
    }

    return ctx.db.quoteSubmission.delete({ where: { id: submission.id } });
  }),
});
