import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Brand colors from CSS variables (set by brand.config.ts)
        brand: {
          primary: 'var(--brand-primary)',
          accent: 'var(--brand-accent)',
          secondary: 'var(--brand-secondary)',
          background: 'var(--brand-background)',
          text: 'var(--brand-text)',
        },
      },
      fontFamily: {
        brand: ['var(--brand-font-primary)', 'sans-serif'],
        'brand-heading': ['var(--brand-font-heading)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config

