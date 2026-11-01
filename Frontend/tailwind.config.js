/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      spacing: {
        '18': '4.5rem',
        '25': '6.25rem',
      },
      colors: {
        primary: '#f47621',
        primaryDark: '#681c0f',
        secondary: '#fbb042',
        headerBg: 'var(--headerBg, #ffffff)',
        headerText: 'var(--headerText, #8b96a2)',
        headerTextActive: 'var(--headerTextActive, #000000)',
        themeBg: 'var(--color-background, #fff7ec)',
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        baloo: ['Baloo Bhaijaan 2', 'cursive', 'sans-serif']
      }
    },
  },
  plugins: [],
}
