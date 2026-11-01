/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#c5a059',         // Gold brand color matching Souq & Sofra logo
        primaryDark: '#2d2013',     // Dark warm coffee brown
        primaryHover: '#b08d4b',
        secondary: '#e65100',       // More-In vibrant accent
        headerBg: 'rgba(255, 255, 255, 0.92)',
        themeBg: '#faf7f2',
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        baloo: ['Baloo Bhaijaan 2', 'cursive', 'sans-serif']
      }
    },
  },
  plugins: [],
}
