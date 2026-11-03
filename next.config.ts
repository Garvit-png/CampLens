// next.config.ts — Next.js ki settings file.
// Abhi hum sirf frontend bana rahe hain, isliye config simple rakha hai.
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      // Ye rule Tailwind CSS ko Turbopack (Next.js ka fast bundler) ke saath chalata hai.
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
