import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Send anyone who lands on a *.vercel.app URL (the default project
      // domain, or any past deployment URL) to the real amplify850.org
      // domain, so the paid domain is always the one that "wins".
      {
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.vercel\\.app$" }],
        destination: "https://www.amplify850.org/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
