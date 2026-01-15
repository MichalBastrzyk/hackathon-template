import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
await jiti.import("./src/env");

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  cacheComponents: true,
  reactCompiler: true,
  compress: true,
  experimental: {
    viewTransition: true,
    inlineCss: true,
    turbopackFileSystemCacheForDev: true,
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
