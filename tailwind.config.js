/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#004B87',
        secondary: '#C19A6B',
        gold: '#C19A6B',
        navy: '#004B87',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
