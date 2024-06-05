import { router } from "../trpc";
import { authRouter } from "./auth";
import { episodeRouter } from "./episode";
import { featureRouter } from "./featureRouter";
import { gameRouter } from "./gameRouter";
import { movieRouter } from "./movieRouter";
import { reviewRouter } from "./reviewRouter";
import { userRouter } from "./userRouter";
import { videoRouter } from "./video";

export const appRouter = router({
  episode: episodeRouter,
  review: reviewRouter,
  movie: movieRouter,
  video: videoRouter,
  user: userRouter,
  auth: authRouter,
	feature: featureRouter,
	game: gameRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
