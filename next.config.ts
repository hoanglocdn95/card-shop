import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/products": [
      "./data/tcgplayer-catalog-one-piece.csv",
      "./data/tcgplayer-catalog-riftbound.csv",
      "./data/tcgplayer-catalog.csv",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pokemontcg.io",
      },
      {
        protocol: "https",
        hostname: "product-images.tcgplayer.com",
      },
    ],
  },
};

export default nextConfig;
initOpenNextCloudflareForDev();
