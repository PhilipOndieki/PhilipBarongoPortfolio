import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  // Keep the bottom-left corner clear during review.
  devIndicators: false,
};

export default nextConfig;
