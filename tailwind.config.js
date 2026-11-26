/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{jsx,js}"],
  theme: {
    extend: {
      backgroundImage: {
        bgImg:
          "url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h16v2h-6v6h6v8H8v-6H2v6H0V0zm4 4h2v2H4V4zm8 8h2v2h-2v-2zm-8 0h2v2H4v-2zm8-8h2v2h-2V4z' fill='%23ffc0ec' fill-opacity='0.42' fill-rule='evenodd'/%3E%3C/svg%3E\")",
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
