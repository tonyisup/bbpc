import { headers } from "next/headers";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

export const api = createTRPCContext().createCaller(appRouter); 