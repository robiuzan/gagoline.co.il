/** @type {import('prettier').Config} */
module.exports = {
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 90,
  tabWidth: 2,
  // Automatically sorts Tailwind utility classes in a consistent canonical order.
  plugins: ["prettier-plugin-tailwindcss"],
  // Also sort classes passed to these helper functions (see lib/utils.ts -> cn()).
  tailwindFunctions: ["cn", "clsx", "twMerge", "cva"],
};
