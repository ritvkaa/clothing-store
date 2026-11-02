import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/admin/access/:secret",
          destination: "/admin-access/:secret",
        },
      ],
    };
  },
};

export default nextConfig;
