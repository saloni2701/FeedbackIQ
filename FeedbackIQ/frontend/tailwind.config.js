/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['"IBM Plex Sans"', 'Arial', 'sans-serif'] },
      colors: {
        page: 'var(--bg)',
        card: 'var(--card)',
        line: 'var(--bd)',
        ink: 'var(--ink)',
        mut: 'var(--mut)',
        nav: 'var(--nav)',
        acc: 'var(--acc)',
        pos: 'var(--pos)',
        neu: 'var(--neu)',
        neg: 'var(--neg)',
        warn: 'var(--warn)',
        soft: 'var(--soft)',
      },
    },
  },
  plugins: [],
};
