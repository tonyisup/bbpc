import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";

import { parseDbUrl } from "./db/parse-db-url";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL is not defined");
}

const { dbUser, dbPassword, dbHost, dbName } = parseDbUrl(dbUrl);


async function createPrismaClient() {
  const sqlConfig = {
    user: dbUser,
    password: dbPassword,
    database: dbName,
    server: dbHost || "localhost",
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    },
    options: {
      encrypt: true, // for azure
      trustServerCertificate: false // change to true for local dev / self-signed certs
    }
  }

  return new PrismaClient({
    adapter: new PrismaMssql(sqlConfig),
    log:
      process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const db = await (globalForPrisma.prisma
  ? Promise.resolve(globalForPrisma.prisma)
  : createPrismaClient());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;