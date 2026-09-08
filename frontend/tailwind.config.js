/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F1115",
        paper: "#FFFDF7",
        stone: { 100: "#F3EFE8", 200: "#E8E0D6", 300: "#D9CFC2", 600: "#8A7F75" },
        terracotta: { DEFAULT: "#E84C2F", hover: "#D13E22", light: "#FFF1EE" },
        brass: "#C9A86A",
        sage: "#6B8F6B",
        amber: "#E6A23C",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        paper: "0 1px 3px rgba(15,17,21,.08), 0 12px 32px rgba(15,17,21,.06)",
        card: "0 1px 2px rgba(15,17,21,.06), 0 4px 16px rgba(15,17,21,.05)",
      },
      borderRadius: { xl: "14px", "2xl": "18px" },
    },
  },
  plugins: [],
}

