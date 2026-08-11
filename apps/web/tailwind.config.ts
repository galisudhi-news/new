import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff5f5",
          100: "#ffe3e3",
          600: "#c00000",
          700: "#a30000",
          900: "#680000"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Arial", "sans-serif"],
        serif: ["var(--font-newsreader)", "Georgia", "serif"]
      },
      boxShadow: {
        editorial: "0 10px 35px rgba(0,0,0,.08)"
      }
    }
  },
  plugins: []
};

export default config;
