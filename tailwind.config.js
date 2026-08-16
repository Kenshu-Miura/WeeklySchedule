/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        oswald: ['Oswald', 'sans-serif'],
        playfair: ['"Playfair Display"', 'serif'],
        mplus: ['"M PLUS Rounded 1c"', 'sans-serif'],
        notojp: ['"Noto Sans JP"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
