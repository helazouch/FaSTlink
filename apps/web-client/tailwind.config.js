/** @type {import('tailwindcss').Config} */
export default {
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
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"Sora"', 'sans-serif'],
        body: ['"Instrument Sans"', '"Manrope"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      backgroundImage: {
        mesh:
          'radial-gradient(circle at 18% 10%, rgba(101,17,239,0.28), transparent 36%), radial-gradient(circle at 83% 6%, rgba(16,200,185,0.2), transparent 38%), radial-gradient(circle at 58% 86%, rgba(255,137,82,0.2), transparent 35%)',
      },
      boxShadow: {
        panel: '0 16px 40px -24px rgba(12, 14, 33, 0.75)',
        glow: '0 32px 60px -30px rgba(101, 17, 239, 0.7)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        rise: 'rise 0.45s ease-out forwards',
        pulseSoft: 'pulseSoft 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

