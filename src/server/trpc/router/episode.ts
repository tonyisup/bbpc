import { z } from "zod";

import { router, publicProcedure } from "../trpc";

export const episodeRouter = router({
  get: publicProcedure
    .input(z.object({id:z.string()}))
    .query(async (req) => {
      return await req.ctx.prisma.episode.findUnique({
        where: {
          id: req.input.id
        },
        include: {
          Assignment: {
            include: {
              User: true,
              Movie: true
            }
          },
          Review: {
            include: {
              Movie: true,
              User: true,
            }
          }
        }
      })
    }),
  latest: publicProcedure
    .query(async (req) => {
      return await req.ctx.prisma.episode.findFirst({
        where: {
          date: {
            lte: new Date()
          }
        },
        orderBy: {
          date: "desc"
        },
        include: {
          Assignment: {
            include: {
              User: true,
              Movie: true
            }
          },
          Review: {
            include: {
              Movie: true,
              User: true,
            }
          }
        }
      })
    }),
  next: publicProcedure
    .query(async (req) => {
      return await req.ctx.prisma.episode.findFirst({
        where: {
          date: {
            gte: new Date()
          }
        },
        include: {
          Assignment: {
            include: {
              User: true,
              Movie: true
            }
          },
          Review: {
            include: {
              Movie: true,
              User: true,
            }
          }
        }
      })  
    })
});
