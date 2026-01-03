import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";
import { env } from "../env/server.mjs";

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};
async function createPrismaClient() {
	const adapter = new PrismaMssql(env.DATABASE_URL)

	return new PrismaClient({
		adapter,
		log:
			env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
	});
}

export const db = await (globalForPrisma.prisma
	? Promise.resolve(globalForPrisma.prisma)
	: createPrismaClient());

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;