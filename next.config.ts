import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.chxgoose.com" }],
        destination: "https://chxgoose.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
