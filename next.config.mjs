/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure PDF font files are bundled into the serverless PDF route
  outputFileTracingIncludes: {
    "/api/invoices/[id]/pdf": ["./public/fonts/**/*"],
  },
};

export default nextConfig;
