import { PrismaClient } from "@prisma/client";
import { PrismaMssql } from "@prisma/adapter-mssql";
import { parseDbUrl } from "./parse-db-url";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL is not defined");
}

const { dbUser, dbPassword, dbHost, dbName } = parseDbUrl(dbUrl);


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
