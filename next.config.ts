import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mediapipe/tasks-vision"],

  async redirects() {
    return [
      { source: "/scrum", destination: "/", permanent: true },
      { source: "/scrum/:id", destination: "/exercise/:id", permanent: true },
    ];
  },
};

export default nextConfig;
