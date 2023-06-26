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
      return await req.ctx.prisma.episode.findMany({
				take: 2,
				skip: 1,
        orderBy: {
					number: "desc"
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
        orderBy: {
					number: "desc"
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
	history: publicProcedure
		.input(z.object({page: z.number(), size: z.number()}))
		.query(async (req) => {
			return await req.ctx.prisma.episode.findMany({
				skip: req.input.page * req.input.size,
				take: req.input.size,
				orderBy: {
					number: "desc"
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
});
