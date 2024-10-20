// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        port: "",
        hostname: "i.ytimg.com",
        pathname: "/vi/**/*",
      },
      {
        protocol: "https",
        port: "",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**/*",
      },
      {
        protocol: "https",
        port: "",
        hostname: "tools.applemediaservices.com",
        pathname: "/api/badges/**/*",
      }
    ]
  }
};
export default config;
