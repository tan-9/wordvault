/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{jsx,js}"],
  theme: {
    extend: {
      backgroundImage: {
        bgImg:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='17' height='17' viewBox='0 0 24 24'%3E%3Cg fill='%23ff9dc4' fill-opacity='0.28'%3E%3Cpolygon fill-rule='evenodd' points='8 4 12 6 8 8 6 12 4 8 0 6 4 4 6 0 8 4'/%3E%3C/g%3E%3C/svg%3E\")",
      },
      fontFamily: {
        outfit: ['"Outfit"', "sans-serif"],
        poppins: ['"Poppins"', "sans-serif"],
        fredoka: ['"Fredoka"', "sans-serif"],
      },
      colors: {
        blush: {
          50: "#fff8fa",
          100: "#fff0f5",
          200: "#ffd6e8",
          300: "#ffb3d1",
          400: "#ff8cbd",
          500: "#ff6fa8",
          600: "#e0559a",
        },
        lavender: {
          50: "#f6f1fc",
          100: "#ede1f8",
          200: "#d9c5ef",
          300: "#c3a8e6",
        },
        mint: {
          100: "#e3f9f2",
          200: "#bdf0e0",
          300: "#8ee3c8",
        },
        cream: "#fffaf3",
        plum: "#7a3b5e",
      },
    },
  },
  plugins: [],
};
