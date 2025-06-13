// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
await import("./src/env.mjs");

import withPWA from 'next-pwa';

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})({
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
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
});

export default config;
