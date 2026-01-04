import { createTRPCRouter } from "@/server/api/trpc";
import { syllabusRouter } from "./routers/syllabus";
import { showRouter } from "./routers/showRouter";
import { uploadInfoRouter } from "./routers/uploadInfo";
import { tagRouter } from "./routers/tagRouter";
import { yearRouter } from "./routers/yearRouter";
import { rankedListRouter } from "./routers/rankedListRouter";
import { gamblingRouter } from "./routers/gamblingRouter";
import { episodeRouter } from "./routers/episodeRouter";
import { authRouter } from "./routers/authRouter";
import { userRouter } from "./routers/userRouter";
import { movieRouter } from "./routers/movieRouter";
import { reviewRouter } from "./routers/reviewRouter";
import { adminRouter } from "./routers/adminRouter";
import { videoRouter } from "./routers/videoRouter";
import { featureRouter } from "./routers/featureRouter";

export const appRouter = createTRPCRouter({
	year: yearRouter,
	tag: tagRouter,
	rankedList: rankedListRouter,
	uploadInfo: uploadInfoRouter,
	gambling: gamblingRouter,
	episode: episodeRouter,
	auth: authRouter,
	user: userRouter,
	movie: movieRouter,
	review: reviewRouter,
	admin: adminRouter,
	video: videoRouter,
	feature: featureRouter,
	syllabus: syllabusRouter,
	show: showRouter,
});

export type AppRouter = typeof appRouter;
