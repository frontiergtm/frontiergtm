import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  webpack(config) {
    // Together's SDK can optionally inspect parquet training files. Scan only uses
    // chat completions, so keep that optional parser out of the server bundle.
    config.resolve.fallback = { ...config.resolve.fallback, parquetjs: false };
    return config;
  },
};

export default nextConfig;
