import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh7-rt.googleusercontent.com",
        port: "",
        pathname: "/**",
      }
    ]
  }
};

export default nextConfig;
