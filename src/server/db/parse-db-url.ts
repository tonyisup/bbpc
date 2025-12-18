export interface DbCredentials {
  dbUser: string;
  dbPassword: string;
  dbHost: string;
  dbName: string;
}

/**
 * Parses a database URL and extracts credentials.
 * Expected format: protocol://username:password@hostname/database
 * 
 * @param databaseUrl The raw DATABASE_URL string
 * @returns An object containing the extracted credentials
 * @throws Error if the URL is invalid or credentials are incomplete
 */
export function parseDbUrl(databaseUrl: string): DbCredentials {
  try {
    const url = new URL(databaseUrl);

    const dbUser = decodeURIComponent(url.username);
    const dbPassword = decodeURIComponent(url.password);
    const dbHost = url.hostname;
    const dbName = url.pathname.replace(/^\//, "");

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
