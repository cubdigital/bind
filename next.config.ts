import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/scrum", destination: "/", permanent: true },
      { source: "/scrum/:id", destination: "/exercise/:id", permanent: true },
    ];
  },
};

export default nextConfig;
