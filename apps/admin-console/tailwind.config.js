/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          50: '#f7fafc',
          100: '#eef2f7',
          200: '#d9e1ec',
          300: '#bcc9d9',
          700: '#2b3a4d',
          800: '#1f2b3a',
          900: '#141d28',
        },
        primary: {
          50: '#e8f1ff',
          100: '#cfe0ff',
          500: '#1d6ff2',
          600: '#175cd1',
          700: '#1249a8',
        },
        success: '#16a34a',
        warning: '#d97706',
        danger: '#dc2626',
      },
      fontFamily: {
        sans: ['"Manrope"', '"Segoe UI"', 'sans-serif'],
        heading: ['"Sora"', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 12px 28px -18px rgba(15, 23, 42, 0.35)',
      },
    },
  },
  plugins: [],
}
