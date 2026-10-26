/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ["192.168.0.5", "192.168.0.9"],
  devIndicators: false,
  async rewrites() {
    const apiUrl = process.env.TAROT_API_URL || "http://localhost:3001";
    return [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }];
  },
};

export default nextConfig;
