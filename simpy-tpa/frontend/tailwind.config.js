/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'simpy-bg': '#F4F1EC',
        'simpy-surface': '#FAFAF7',
        'simpy-green': '#2D6A4F',
        'simpy-green-light': '#52B788',
        'simpy-green-pale': '#D8F3DC',
        'simpy-border': '#D9D4CB',
        'simpy-muted': '#6B6560',
        'simpy-amber': '#E9A319',
        'simpy-red': '#C0392B',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        mono: ['"DM Mono"', 'monospace'],
        sans: ['"Instrument Sans"', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
