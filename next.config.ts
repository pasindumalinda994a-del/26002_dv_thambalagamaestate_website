import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gallery uploads allow up to 5MB; Next defaults Server Actions to 1MB.
  // Leave headroom for multipart form overhead on the raw HTTP body.
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  images: {
    // Allow sharper hero delivery; mobile cover crops need larger candidates.
    qualities: [75, 90, 95],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  turbopack: {
    resolveAlias: {
      "mapbox-gl": "mapbox-gl/dist/mapbox-gl.js",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "mapbox-gl": "mapbox-gl/dist/mapbox-gl.js",
    };
    return config;
  },
};

export default nextConfig;
