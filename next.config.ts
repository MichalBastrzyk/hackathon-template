import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Embrace stricter/reactive runtime guarantees and new platform features.
  reactStrictMode: true,
  typedRoutes: true,
  cacheComponents: true,
  reactCompiler: true,
  experimental: {
    viewTransition: true,
    inlineCss: true,
    serverSourceMaps: true,
    turbopackFileSystemCacheForDev: true,
  },
  turbopack: {
    debugIds: true,
  },
}

export default nextConfig
