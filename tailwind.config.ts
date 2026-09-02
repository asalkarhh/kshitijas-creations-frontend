import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        rose: 'rgb(var(--color-rose) / <alpha-value>)',
        maroon: 'rgb(var(--color-maroon) / <alpha-value>)',
        beige: 'rgb(var(--color-beige) / <alpha-value>)',
        gold: 'rgb(var(--color-gold) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 16px 45px -28px rgb(77 37 42 / 0.35)',
        soft: '0 10px 30px -22px rgb(77 37 42 / 0.25)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
