/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/*.jsx"
  ],
  theme: {
    extend: {
      backgroundImage: {
        'bgImg': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='17' height='17' viewBox='0 0 24 24'%3E%3Cg fill='%239C92AC' fill-opacity='0.19'%3E%3Cpolygon fill-rule='evenodd' points='8 4 12 6 8 8 6 12 4 8 0 6 4 4 6 0 8 4'/%3E%3C/g%3E%3C/svg%3E\")"
      },
      fontFamily: {
        outfit: ['"Outfit"', 'sans-serif'],
        poppins: [' "Poppins ', 'sans-serif'],
      }
    },
  },
  plugins: [],
}