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
        // Goldoak Insurance Brand Colors
        primary: '#003220', // Deep Green (Primary)
        secondary: '#be862b', // Gold (Secondary)
        gold: '#be862b',
        green: '#003220',
        // Brand color aliases
        'brand-gold': '#be862b',
        'brand-green': '#003220',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
