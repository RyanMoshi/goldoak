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
        // GoldOak Insurance Brand Colors
        primary: '#003220', // Primary Green
        secondary: '#BE862B', // Accent Gold
        gold: '#BE862B',
        green: '#003220',
        // Brand color aliases
        'brand-gold': '#BE862B',
        'brand-green': '#003220',
        // Text colors
        'text-headline': '#111',
        'text-body': '#333',
        // Background colors
        'bg-section': '#F9F9F9',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
