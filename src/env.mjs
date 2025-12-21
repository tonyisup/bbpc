import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    DATABASE_URL: z.string().min(1),
    NEXTAUTH_SECRET: z.string().optional(),
    NEXTAUTH_URL: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    PHONE_NUMBER: z.string().optional(),
    TMDB_API_KEY: z.string().optional(),
    GOOGLE_API_KEY: z.string().optional(),
    EMAIL_SERVER_USER: z.string().optional(),
    EMAIL_SERVER_PASSWORD: z.string().optional(),
    EMAIL_SERVER_HOST: z.string().optional(),
    EMAIL_SERVER_PORT: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
    MAX_RECORDING_TIME: z.string().optional(),
  },
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    PHONE_NUMBER: process.env.PHONE_NUMBER,
    TMDB_API_KEY: process.env.TMDB_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
    EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
    EMAIL_FROM: process.env.EMAIL_FROM,
    MAX_RECORDING_TIME: process.env.MAX_RECORDING_TIME,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
