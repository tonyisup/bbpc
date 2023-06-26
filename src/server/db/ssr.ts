import { prisma } from "./client";

export const ssr = {
	getLatestEpisode: async function () {
		return await prisma.episode.findMany({
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
		});
	},
	getNextEpisode: async function () {
		return await prisma.episode.findFirst({
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
		});
	},
	getEpisodeHistory: async function(page: number, size: number) {
		return await prisma.episode.findMany({
			skip: page * size,
			take: size,
			orderBy: {
				date: 'desc',
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
		});
	}
};
