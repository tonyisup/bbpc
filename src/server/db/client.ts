import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}
const dbUrl = process.env.DATABASE_URL
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

const sqlConfig = {
  user: dbUser,
  password: dbPassword,
  database: dbName,
  server: dbHost,
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
const adapter = new PrismaMssql(sqlConfig)
export const prisma = new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
