import type { Config } from "tailwindcss";

/**
 * Gagoline design system — derived from brief.md Parts F2 (color) & F3 (typography).
 * 🔶 All brand hex values are proposed assumptions; confirm with client before launch.
 *
 * Brand intent: deep trustworthy navy base + a warm amber CTA accent so "click me"
 * buttons pop against the all-blue competitor field (see brief Part F2).
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary — deep trustworthy navy (brand, headers, links). 🔶
        primary: {
          DEFAULT: "#0E2E4E",
          50: "#EAF0F6",
          100: "#C9D8E8",
          200: "#9CB6D1",
          300: "#6E93BA",
          400: "#3F6E9E",
          500: "#1B4870",
          600: "#0E2E4E",
          700: "#0B2540",
          800: "#081D33",
          900: "#051322",
          foreground: "#FFFFFF",
        },
        // Secondary — clean sky / water blue (accents, highlights, icons). 🔶
        secondary: {
          DEFAULT: "#1F8FD0",
          50: "#E8F4FB",
          100: "#C4E2F4",
          200: "#9CCEEC",
          300: "#73BAE3",
          400: "#4FA9DC",
          500: "#1F8FD0",
          600: "#166FA3",
          700: "#11597F",
          800: "#0C415C",
          900: "#082B3D",
          foreground: "#FFFFFF",
        },
        // Accent / CTA — warm amber-orange (the conversion "click me" color). 🔶
        accent: {
          DEFAULT: "#F5841F",
          50: "#FEF1E4",
          100: "#FDDCBC",
          200: "#FBC48E",
          300: "#F9AC60",
          400: "#F79D4D",
          500: "#F5841F",
          600: "#D86E0C",
          700: "#AB570A",
          800: "#7E4007",
          900: "#522A04",
          foreground: "#FFFFFF",
        },
        // Neutrals, success, error: intentionally left to Tailwind defaults (gray/green/red)
        // per brief Part F2 (🟦 defaults).
      },
      fontFamily: {
        // Body / default — Heebo (clean, highly legible Hebrew). See brief F3.
        sans: ["var(--font-heebo)", "system-ui", "Arial", "sans-serif"],
        // Headings — Rubik (modern, strong Hebrew), falls back to Heebo.
        heading: ["var(--font-rubik)", "var(--font-heebo)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        // Soft-rounded corners (brief Part F5).
        DEFAULT: "0.5rem",
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "1.5rem",
          lg: "2rem",
        },
        screens: {
          "2xl": "1280px",
        },
      },
    },
  },
  plugins: [],
};

export default config;
