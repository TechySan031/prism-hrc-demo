import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "*.trycloudflare.com",
    "oak-das-stones-known.trycloudflare.com",
  ],
};

export default nextConfig;
