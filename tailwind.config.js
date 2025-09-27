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
        // Brand Colors Only
        primary: '#004B87', // Green (Primary)
        secondary: '#C19A6B', // Gold (Secondary)
        green: '#004B87',
        gold: '#C19A6B',
        // Brand color aliases
        'brand-green': '#004B87',
        'brand-gold': '#C19A6B',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
