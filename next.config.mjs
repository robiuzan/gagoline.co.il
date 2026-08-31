/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Shared hub package (@ishub/site-kit) ships raw TS; Next must transpile it.
  transpilePackages: ["@ishub/site-kit"],
  // Static HTML export — deploy target is CLOUDFLARE PAGES (project `gagoline`), uploaded by
  // wrangler via the hub's ops/deploy-site.ps1. Produces an `out/` folder of static files.
  // This comment used to name a cPanel/Apache docroot; that host stopped being served and the
  // stale claim cost a misdirected production deploy. See CLAUDE.md §10.
  output: "export",
  trailingSlash: true,
  images: {
    // No Next image-optimization server on static hosting.
    unoptimized: true,
    remotePatterns: [],
  },
};

export default nextConfig;
