import type { NextConfig } from "next";
import { hostRedirects } from "./lib/redirects";
import { SECURITY_HEADERS } from "./lib/security";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return hostRedirects();
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: Object.entries(SECURITY_HEADERS).map(([key, value]) => ({ key, value })),
      },
    ];
  },
};

export default nextConfig;
