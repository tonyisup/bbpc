
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const uploadInfoRouter = createTRPCRouter({
  getAssignmentUploadInfo: protectedProcedure
    .input(z.object({
      assignmentId: z.string(),
      userId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const assignment = await ctx.db.assignment.findUnique({
        where: { id: input.assignmentId },
        include: {
          Episode: true,
          Movie: true,
        },
      });

      if (!assignment) {
        throw new Error("Assignment not found");
      }

      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const messageCount = await ctx.db.audioMessage.count({
        where: {
          userId: input.userId,
          assignmentId: input.assignmentId,
        },
      });

      return {
        episodeNumber: assignment.Episode.number,
        movieName: assignment.Movie.title,
        userName: user.name,
        messageCount: messageCount,
      };
    }),

  getEpisodeUploadInfo: protectedProcedure
    .input(z.object({
      episodeId: z.string(),
      userId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const episode = await ctx.db.episode.findUnique({
        where: { id: input.episodeId },
      });

      if (!episode) {
        throw new Error("Episode not found");
      }

      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const messageCount = await ctx.db.audioEpisodeMessage.count({
        where: {
          userId: input.userId,
          episodeId: input.episodeId,
        },
      });

      return {
        episodeNumber: episode.number,
        userName: user.name,
        messageCount: messageCount,
      };
    }),
});
