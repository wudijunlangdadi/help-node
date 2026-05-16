/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          bg: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          text: 'var(--text-primary)',
          'text-secondary': 'var(--text-secondary)',
          accent: 'var(--accent)',
          error: 'var(--error)',
          success: 'var(--success)',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
