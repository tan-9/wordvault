/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/*.jsx"
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['"Outfit"', 'sans-serif'],
        poppins: [' "Poppins ', 'sans-serif'],
      }
    },
  },
  plugins: [],
}