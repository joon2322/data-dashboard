import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:date(\\d{4}-\\d{2}-\\d{2})",
        destination: "/daily/:date",
        permanent: true,
      },
      {
        source: "/:date(\\d{4}-\\d{2}-\\d{2})/:section",
        destination: "/daily/:date/:section",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
