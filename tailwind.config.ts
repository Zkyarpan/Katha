import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        katha: {
          indigo: "#22183D",
          indigoLight: "#3A2A5E",
          plum: "#5C3678",
          sunset: "#DB7052",
          gold: "#F0B95C",
          goldLight: "#F8D590",
          cream: "#F7EDD6",
          muted: "#B8A9D9",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)"],
        sans: ["var(--font-inter)"],
      },
      backgroundImage: {
        "katha-gradient":
          "linear-gradient(180deg, #22183D 0%, #3A2A5E 50%, #5C3678 100%)",
      },
    },
  },
  plugins: [],
};
export default config;