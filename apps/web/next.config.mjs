const expressPort = process.env.EXPRESS_PORT || 4000;

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/product",
        destination: "/",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      fallback: [
        {
          source: "/api/docs",
          destination: `http://localhost:${expressPort}/docs/`,
        },
        {
          source: "/api/:path*",
          destination: `http://localhost:${expressPort}/:path*`,
        },
      ],
    };
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  transpilePackages: ["@bingle/ui"],
};

export default nextConfig;
