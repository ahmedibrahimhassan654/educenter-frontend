import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#0052D4",
          50: "#E6F0FF",
          100: "#CCE0FF",
          200: "#99C2FF",
          300: "#66A3FF",
          400: "#3385FF",
          500: "#0052D4",
          600: "#0042AA",
          700: "#003380",
          800: "#002255",
          900: "#00112B",
        },
        secondary: {
          DEFAULT: "#00D2B4",
          50: "#E6FFF9",
          100: "#CCFFF3",
          200: "#99FFE7",
          300: "#66FFDB",
          400: "#33FFCF",
          500: "#00D2B4",
          600: "#00A890",
          700: "#007E6C",
          800: "#005448",
          900: "#002A24",
        },
        accent: {
          DEFAULT: "#00E5FF",
          50: "#E6FBFF",
          100: "#CCF7FF",
          200: "#99EFFF",
          300: "#66E7FF",
          400: "#33DFFF",
          500: "#00E5FF",
          600: "#00B8CC",
          700: "#008A99",
          800: "#005C66",
          900: "#002E33",
        },
      },
    },
  },
  plugins: [],
};
export default config;