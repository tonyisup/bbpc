import { z } from "zod";
import { type Rating } from "@prisma/client";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const movieRouter = createTRPCRouter({
	searchByPage: publicProcedure
		.input(z.object({
			page: z.number(),
			term: z.string(),
		}))
		.query(async ({ ctx, input }) => {
			return ctx.tmdb.getMovies(input.page, input.term)
		}),
	search: protectedProcedure
		.input(z.object({
			term: z.string(),
		}))
		.query(async ({ ctx, input }) => {
			if (input.term.length === 0) {
				return [];
			}
			if (!isNaN(parseInt(input.term)) && input.term.length === 4) {
				const year = parseInt(input.term);
				return ctx.db.movie.findMany({
					where: {
						OR: [
							{
								title: {
									contains: input.term,
								},
							},
							{
								year: {
									equals: parseInt(input.term),
								},
							},
						],
					},
					orderBy: {
						title: 'asc',
					},
					take: 10,
				});
			}
			return ctx.db.movie.findMany({
				where: {
					title: {
						contains: input.term,
					},
				},
				orderBy: {
					title: 'asc',
				},
				take: 10,
			});
		}),
	getTitle: protectedProcedure
		.input(z.object({
			id: z.number(),
		}))
		.query(({ ctx, input }) => {
			return ctx.tmdb.getMovie(input.id)
		}),

	add: publicProcedure
		.input(z.object({
			title: z.string(),
			year: z.number(),
			poster: z.string(),
			url: z.string(),
			tmdbId: z.number().optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			const exists = await ctx.db.movie.findFirst({
				where: {
					url: input.url
				}
			})
			if (exists) {
				return await ctx.db.movie.update({
					where: {
						id: exists.id
					},
					data: {
						title: input.title,
						year: input.year,
						poster: input.poster,
						url: input.url,
						tmdbId: input.tmdbId,
					}
				})
			}
			return await ctx.db.movie.create({
				data: {
					title: input.title,
					year: input.year,
					poster: input.poster,
					url: input.url,
					tmdbId: input.tmdbId,
				}
			})
		}),
	searchByNext10Page: protectedProcedure
		.input(z.object({
			term: z.string(),
			page: z.number(),
		}))
		.query(async ({ ctx, input }) => {
			if (input.term.length === 0) {
				return [];
			}
			if (!isNaN(parseInt(input.term)) && input.term.length === 4) {
				const year = parseInt(input.term);
				return ctx.db.movie.findMany({
					where: {
						OR: [
							{
								title: {
									contains: input.term,
								},
							},
							{
								year: {
									equals: parseInt(input.term),
								},
							},
						],
					},
					orderBy: {
						title: 'asc',
					},
					take: 10,
					skip: input.page * 10,
				});
			}
			return ctx.db.movie.findMany({
				where: {
					title: {
						contains: input.term,
					},
				},
				orderBy: {
					title: 'asc',
				},
				take: 10,
				skip: input.page * 10,
			});
		}),
	assignment: publicProcedure
		.input(z.object({
			id: z.string()
		}))
		.query(async ({ ctx, input }) => {
			return await ctx.db.assignment.findUnique({
				where: {
					id: input.id
				},
			});
		}),
	assignmentRatings: publicProcedure
		.input(z.object({
			assignmentId: z.string(),
		}))
		.query(async ({ ctx, input }) => {
			return await ctx.db.$queryRaw<Rating[]>`select * from [dbo].[AssignmentRatings] where [assignmentId] = ${input.assignmentId}`;
		}),
	ratings: publicProcedure
		.query(async ({ ctx }) => {
			return await ctx.db.rating.findMany({
				orderBy: {
					value: 'asc'
				}
			});
		}),
	find: publicProcedure
		.input(z.object({
			searchTerm: z.string(),
		}))
		.query(async ({ ctx, input }) => {
			return await ctx.db.movie.findMany({
				where: {
					title: {
						contains: input.searchTerm,
					}
				}
			});
		}),
	get: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(({ ctx, input }) => {
			return ctx.db.movie.findUnique({
				where: { id: input.id },
			});
		}),
	getAll: publicProcedure
		.query(({ ctx }) => {
			return ctx.db.movie.findMany();
		}),
	getSummary: publicProcedure
		.query(({ ctx }) => {
			return ctx.db.movie.count();
		}),
});
