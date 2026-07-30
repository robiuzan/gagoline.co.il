/** @type {import('prettier').Config} */
module.exports = {
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 90,
  tabWidth: 2,
  // Automatically sorts Tailwind utility classes in a consistent canonical order.
  // Tailwind v4: point the plugin at the CSS entry (@theme), not a JS config.
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./app/globals.css",
  // Also sort classes passed to these helper functions (see lib/utils.ts -> cn()).
  tailwindFunctions: ["cn", "clsx", "twMerge", "cva"],
};
