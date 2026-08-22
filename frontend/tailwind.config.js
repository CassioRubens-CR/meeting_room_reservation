/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef5fc',
          100: '#dceafb',
          200: '#b9d5f2',
          300: '#8db7e5',
          400: '#5f91c9',
          500: '#114881',
          600: '#0e3b6b',
          700: '#0b3158',
          800: '#082642',
          900: '#061c31',
        },
        accent: {
          50: '#e6fdff',
          100: '#b3f8ff',
          200: '#80f3ff',
          300: '#4deeff',
          400: '#1ae9ff',
          500: '#00e6ff',
          600: '#00b8cc',
          700: '#008a99',
          800: '#005c66',
          900: '#002e33',
        },
      },
    },
  },
  plugins: [],
}

