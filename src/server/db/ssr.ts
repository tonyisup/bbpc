import { prisma } from "./client";

export const ssr = {
	getLatestEpisode: async function () {
		return await prisma.episode.findFirst({
			where: {
				date: {
					lt: new Date(new Date().toLocaleDateString("en", { timeZone: 'America/Los_Angeles' }))
				}
			},
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
	},
	getNextEpisode: async function () {
		return await prisma.episode.findFirst({
			where: {
				OR: [
					{
						date: {
							gte: new Date(new Date().toLocaleDateString("en", { timeZone: 'America/Los_Angeles' }))
						},
					},
					{
						date: {
							equals: null
						},
					},
				]
			},
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
