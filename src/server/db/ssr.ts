import { prisma } from "./client";

export const ssr = {

	getAssignment: async function (id: string) {
		return await prisma.assignment.findUnique({
			where: {
				id: id
			},
			include: {
				User: true,
				Movie: true,
				assignmentReviews: {
					include: {
						Review: {
							include: {
								User: true
							}
						}
					}
				}
			}
		});
	},
	getLatestEpisode: async function () {
		return await prisma.episode.findMany({
			take: 2,
			skip: 1,
			orderBy: {
				number: "desc"
			},
			include: {
				links: true,
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
		});
	},
	getNextEpisode: async function () {
		return await prisma.episode.findFirst({
			orderBy: {
				number: "desc"
			},
			include: {
				links: true,
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
		});
	},
	getEpisodeHistory: async function () {
		return await prisma.episode.findMany({
			orderBy: {
				date: 'desc',
			},
			include: {
				links: true,
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
		});
	}
};
