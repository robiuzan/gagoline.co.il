/**
 * images-dev.mjs — `next dev` with IMAGES_DRAFT=1, so candidate images render on the real pages
 * (from /images/_candidates/, each with the "טיוטה — ממתין לאישור" badge) for the owner's review
 * before anything is approved. Portable: the same line works from PowerShell 5.1, Git Bash and
 * the review board's spawn, which is why this exists instead of a shell-specific env prefix.
 *
 * Usage: npm run dev:images
 */

import { spawn } from "node:child_process";

console.log(
  "images-dev: starting `npm run dev` with IMAGES_DRAFT=1 — candidates render with a badge.\n" +
    "  Review at http://localhost:3000<route>#img-<id>; nothing here can reach a production build.\n",
);

const child = spawn("npm", ["run", "dev"], {
  env: { ...process.env, IMAGES_DRAFT: "1" },
  shell: true,
  stdio: "inherit",
});
child.on("exit", (code) => process.exit(code ?? 0));
