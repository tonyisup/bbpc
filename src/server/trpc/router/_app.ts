import { router } from "../trpc";
import { authRouter } from "./auth";
import { episodeRouter } from "./episode";

export const appRouter = router({
  episode: episodeRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
