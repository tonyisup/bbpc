import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";

import { env } from "@/env.mjs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

async function createPrismaClient() {
  const sqlConfig = {
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    server: env.DB_HOST,
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
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const db = await (globalForPrisma.prisma
  ? Promise.resolve(globalForPrisma.prisma)
  : createPrismaClient());

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;