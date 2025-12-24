import { appRouter } from "@/server/api/root";
import { createTRPCContext, createCallerFactory } from "@/server/api/trpc";

const createCaller = createCallerFactory(appRouter);

export const getServerApi = async () => {
  const context = await createTRPCContext();
  return createCaller(context);
}; 