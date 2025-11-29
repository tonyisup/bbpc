import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const dbUrl = process.env.DATABASE_URL // sqlserver://bbpc.database.windows.net;database=dev;user=bbpc-login;password=_S?A17Dv.-4(ZG>b;encrypt=true
if (!dbUrl) {
  throw new Error("DATABASE_URL is not defined");
}
/* parse dbUrl */

const dbUser = dbUrl.split(";")[2]?.split("=")[1]
if (!dbUser) {
  throw new Error("DB User is not defined");
}
const dbPassword = dbUrl.split(";")[3]?.split("=")[1]
if (!dbPassword) {
  throw new Error("DB Password is not defined");
}
const dbName = dbUrl.split(";")[1]?.split("=")[1]
if (!dbName) {
  throw new Error("DB Name is not defined");
}
const dbHost = dbUrl.split(";")[0]?.split("://")[1]
if (!dbHost) {
  throw new Error("DB Host is not defined");
}

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