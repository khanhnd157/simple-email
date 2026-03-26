import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        sidebar: {
          bg: '#f8fafc',
          hover: '#f1f5f9',
          active: '#e2e8f0',
          border: '#e2e8f0',
        },
        navy: {
          50: '#e8eef5',
          100: '#d0dce8',
          200: '#b0c4d6',
          300: '#8da3b8',
          400: '#6b8298',
          500: '#4a6580',
          600: '#365168',
          700: '#2a3f52',
          800: '#233645',
          850: '#1f303f',
          900: '#1c2b3a',
          950: '#151f2c',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
