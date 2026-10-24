// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F2F4F8", // El gris azulado de fondo
        primary: "#141C31", // Negro azulado del header
        accent: "#05D49B", // Verde menta de los botones
        dispense: "#5D45FF", // Púrpura del botón dispensar
      },
    },
  },
  plugins: [],
};
export default config;