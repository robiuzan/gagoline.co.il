/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Shared hub package (@ishub/site-kit) ships raw TS; Next must transpile it.
  transpilePackages: ["@ishub/site-kit"],
  // Static HTML export — deploy target is the cPanel (websquadinc) docroot, served by
  // Apache. Produces an `out/` folder of static files (no Node runtime on the host).
  output: "export",
  trailingSlash: true,
  images: {
    // No Next image-optimization server on static hosting.
    unoptimized: true,
    remotePatterns: [],
  },
};

export default nextConfig;
