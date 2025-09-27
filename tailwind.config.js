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
        primary: '#0d3d6e', // Deep Blue (Primary)
        secondary: '#C19A6B', // Warm Gold (Secondary)
        accent: '#1e5a8a', // Lighter Blue
        gold: '#C19A6B',
        // Brand color aliases
        'brand-blue': '#0d3d6e',
        'brand-gold': '#C19A6B',
        'brand-accent': '#1e5a8a',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
