import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    allowedDevOrigins: [
      "localhost:3101",
      "192.168.3.103:3101",
    ],
};

export default nextConfig;
