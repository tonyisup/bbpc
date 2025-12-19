export interface DbCredentials {
  dbUser: string;
  dbPassword: string;
  dbHost: string;
  dbName: string;
}

/**
 * Parses a database URL and extracts credentials.
 * Expected format: protocol://hostname;database=database;user=username;password=password
 * 
 * @param databaseUrl The raw DATABASE_URL string
 * @returns An object containing the extracted credentials
 * @throws Error if the URL is invalid or credentials are incomplete
 */
export function parseDbUrl(databaseUrl: string): DbCredentials {
  try {
    const dbUser = decodeURIComponent(databaseUrl.split(";").find(param => param.startsWith("user="))?.split("=")[1] ?? "");
    const dbPassword = decodeURIComponent(databaseUrl.split(";").find(param => param.startsWith("password="))?.split("=")[1] ?? "");
    const dbHost = databaseUrl.split(";").find(param => param.startsWith("sqlserver://"))?.split("//")[1];
    const dbName = decodeURIComponent(databaseUrl.split(";").find(param => param.startsWith("database="))?.split("=")[1] ?? "");

    if (!dbUser || !dbPassword || !dbHost || !dbName) {
      throw new Error("Incomplete database credentials in DATABASE_URL");
    }

    return {
      dbUser,
      dbPassword,
      dbHost,
      dbName,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "Incomplete database credentials in DATABASE_URL") {
      throw error;
    }
    throw new Error(`Failed to parse DATABASE_URL: ${error instanceof Error ? error.message : String(error)}`);
  }
}
