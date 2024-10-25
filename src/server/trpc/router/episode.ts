import { z } from "zod";

import { router, publicProcedure, protectedProcedure } from "../trpc";

export const episodeRouter = router({
  get: publicProcedure
    .input(z.object({id:z.string()}))
    .query(async (req) => {
      return await req.ctx.prisma.episode.findUnique({
        where: {
          id: req.input.id
        },
        include: {
          assignments: {
            include: {
              User: true,
              Movie: true
            }
          },
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
          assignments: {
            include: {
              User: true,
              Movie: true
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
          assignments: {
            include: {
              User: true,
              Movie: true
            }
          },
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
					assignments: {
						include: {
							User: true,
							Movie: true
						}
					},
				}
			})
		}),
	search: publicProcedure
		.input(z.object({query: z.string()}))
		.query(async (req) => {
			return await req.ctx.prisma.episode.findMany({
				where: {
					OR: [
						{
							assignments: {
								some: {
									Movie: {
										title: {
											contains: req.input.query
										}
									}
								}
							}
						},
						{
							extras: {
								some: {
									Review: {
										Movie: {
											title: {
												contains: req.input.query
											}
										}
									}
								}
							}
						}
					]
				},
				include: {
					assignments: {
						include: {
							User: true,
							Movie: true
						}
					},
					extras: {
						include: {
							Review: {
								include: {
									User: true,
									Movie: true
								}
							}
						}
					}
				}
			})
		}),
	updateAudioMessage: protectedProcedure
		.input(z.object({id: z.number(), episodeId: z.string(), fileKey: z.string()}))
		.mutation(async (req) => {
			return await req.ctx.prisma.audioEpisodeMessage.update({
				where: { id: req.input.id },
				data: { episodeId: req.input.episodeId, fileKey: req.input.fileKey }
			});
		}),
	getCountOfUserEpisodeAudioMessages: publicProcedure
		.input(z.object({episodeId: z.string(), userId: z.string()}))
		.query(async (req) => {
			return await req.ctx.prisma.audioEpisodeMessage.count({ where: { episodeId: req.input.episodeId, userId: req.input.userId } });
		})
});
