import { db } from "../db";
export const ssr = {

	getAssignment: async function (id: string) {
		return await db.assignment.findUnique({
			where: {
				id: id
			},
			include: {
				user: true,
				movie: true,
				assignmentReviews: {
					include: {
						review: {
							include: {
								user: true
							}
						}
					}
				}
			}
		});
	},
	getLatestEpisode: async function () {
		return await db.episode.findMany({
			take: 2,
			skip: 1,
			orderBy: {
				number: "desc"
			},
			include: {
				links: true,
				assignments: {
					include: {
						user: true,
						movie: true
					}
				},
				extras: {
					include: {
						review: {
							include: {
								user: true,
								movie: true
							}
						}
					}
				}
			}
		});
	},
	getNextEpisode: async function () {
		return await db.episode.findFirst({
			orderBy: {
				number: "desc"
			},
			include: {
				links: true,
				assignments: {
					include: {
						user: true,
						movie: true
					}
				},
				extras: {
					include: {
						review: {
							include: {
								user: true,
								movie: true
							}
						}
					}
				}
			}
		});
	},
	getEpisodeHistory: async function () {
		return await db.episode.findMany({
			orderBy: {
				date: 'desc',
			},
			include: {
				links: true,
				assignments: {
					include: {
						user: true,
						movie: true
					}
				},
				extras: {
					include: {
						review: {
							include: {
								user: true,
								movie: true
							}
						}
					}
				}
			}
		});
	}
};
