/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.tsx', './src/**/*.jsx', './src/**/*.html'],
  darkMode: true,
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        'roboto-condensed': ['Roboto Condensed', 'sans-serif'],
      }
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
