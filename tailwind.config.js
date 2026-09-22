/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#10b981',
          hover: '#059669',
          light: '#34d399',
          dark: '#064e3b',
          glow: 'rgba(16, 185, 129, 0.15)',
        },
        surface: {
          base: '#0d1117',
          bg: '#0a0d14',
          sidebar: '#0e121b',
          card: '#131823',
          border: '#1f2737',
          hover: '#182030',
          active: '#1c2436',
          elevation2: '#161b26',
          elevation3: '#1e2638',
        },
        priority: {
          p1: '#ef4444',
          p2: '#f59e0b',
          p3: '#eab308',
          p4: '#64748b',
          sync: '#10b981',
        },
      },
    },
  },
  plugins: [],
};
