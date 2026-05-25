/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2ebff',
          100: '#e5d7ff',
          200: '#cbb1ff',
          300: '#b28bff',
          400: '#9966ff',
          500: '#7f3fff',
          600: '#6511EF',
          700: '#4e0ac0',
          800: '#38078d',
          900: '#23045a',
          DEFAULT: '#6511EF',
        },
        ink: '#0f1021',
        canvas: '#f3f5fb',
        mint: '#10c8b9',
        ember: '#ff8952',
        surface: {
          50: '#f8f8ff',
          100: '#edf0fb',
          200: '#d8ddf1',
          300: '#b3bbd6',
          700: '#2a2d4a',
          800: '#1a1d35',
          900: '#111325',
        },
        primary: {
          50: '#f2ebff',
          100: '#e5d7ff',
          500: '#7f3fff',
          600: '#6511EF',
          700: '#4e0ac0',
        },
        success: '#10c8b9',
        warning: '#ff8952',
        danger: '#dc2626',
      },
      fontFamily: {
        sans: ['"Instrument Sans"', '"Manrope"', 'sans-serif'],
        body: ['"Instrument Sans"', '"Manrope"', 'sans-serif'],
        heading: ['"Space Grotesk"', '"Sora"', 'sans-serif'],
        display: ['"Space Grotesk"', '"Sora"', 'sans-serif'],
      },
      backgroundImage: {
        mesh:
          'radial-gradient(circle at 18% 10%, rgba(101,17,239,0.24), transparent 36%), radial-gradient(circle at 83% 6%, rgba(16,200,185,0.18), transparent 38%), radial-gradient(circle at 58% 86%, rgba(255,137,82,0.16), transparent 35%)',
      },
      boxShadow: {
        panel: '0 18px 44px -26px rgba(12, 14, 33, 0.58)',
        glow: '0 32px 60px -30px rgba(101, 17, 239, 0.55)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        pulseSoft: 'pulseSoft 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
