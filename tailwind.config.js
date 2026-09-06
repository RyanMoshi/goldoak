/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand: forest green + savannah gold (BRAND_INTEGRATION.md)
        navy: {
          50: '#eef4f0',
          100: '#dbe8df',
          200: '#b7d1bf',
          300: '#8fb39f',
          400: '#5f9078',
          500: '#2a6b4f',
          600: '#1a5a3f',
          700: '#073423',
          800: '#052519',
          900: '#041c13',
          950: '#02120c',
        },
        forest: {
          DEFAULT: '#073423',
          100: '#e6efe9',
          500: '#2a6b4f',
          700: '#0f4d34',
        },
        gold: {
          50: '#faf5ec',
          100: '#f6ecd8',
          200: '#ead4a8',
          300: '#dbb977',
          400: '#c28d38',
          500: '#a8752b',
          600: '#8f6224',
          700: '#7a541a',
          800: '#5c3f13',
          900: '#3e2a0c',
          950: '#231705',
          DEFAULT: '#c28d38',
        },
        primary: '#073423',
        secondary: '#c28d38',
        'text-headline': '#16211b',
        'text-body': '#4a5550',
        'bg-section': '#f8f7f4',
        'bg-cream': '#faf9f6',

        // Platform (Super Agent) tokens
        canvas: '#f7f4ec',
        surface: {
          DEFAULT: '#ffffff',
          2: '#f2efe5',
          3: '#fcfaf7',
        },
        line: {
          DEFAULT: '#e8e3d5',
          strong: '#d8d2c2',
        },
        divider: '#f0ece1',
        ink: {
          DEFAULT: '#16211b',
          muted: '#5d6b63',
          faint: '#8a968f',
        },
        success: '#1f7a4d',
        warning: '#c47c1b',
        error: '#b3261e',
        info: '#2b5f8e',
      },
      fontFamily: {
        serif: ['var(--font-petrona)', 'Petrona', 'Georgia', 'serif'],
        sans: ['var(--font-karla)', 'Karla', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'ui-monospace', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display': ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'heading-1': ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'heading-2': ['clamp(1.5rem, 3vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'heading-3': ['clamp(1.25rem, 2vw, 1.75rem)', { lineHeight: '1.2' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
        'body': ['1rem', { lineHeight: '1.7' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6' }],
        'caption': ['0.75rem', { lineHeight: '1.5' }],
      },
      borderRadius: {
        control: '6px',
        card: '10px',
      },
      boxShadow: {
        float: '0 4px 16px -2px rgba(7, 52, 35, 0.08), 0 1px 2px 0 rgba(7, 52, 35, 0.04)',
        drawer: '0 12px 40px -8px rgba(7, 52, 35, 0.28)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-up': 'fadeUp 0.35s ease-out both',
        'fade-in-fast': 'fadeIn 0.2s ease-out both',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
