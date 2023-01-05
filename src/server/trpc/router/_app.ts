import { router } from "../trpc";
import { authRouter } from "./auth";
import { episodeRouter } from "./episode";
import { movieRouter } from "./movieRouter";
import { reviewRouter } from "./reviewRouter";
import { userRouter } from "./userRouter";

export const appRouter = router({
  episode: episodeRouter,
  review: reviewRouter,
  movie: movieRouter,
  user: userRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
