import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
await jiti.import("./src/env");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Embrace stricter/reactive runtime guarantees and new platform features.
  // reactStrictMode: true,
  typedRoutes: true,
  // cacheComponents: true,
  // reactCompiler: true,
  experimental: {
    viewTransition: true,
    inlineCss: true,
    // serverSourceMaps: true,
    // turbopackFileSystemCacheForDev: true,
  },
  turbopack: {
    // debugIds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.your-objectstorage.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
