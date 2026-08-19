import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Default (bottom-left) sits under the sidebar's account menu in every
  // role shell — move it out of the way.
  devIndicators: {
    position: "top-right",
  },
};

export default nextConfig;
