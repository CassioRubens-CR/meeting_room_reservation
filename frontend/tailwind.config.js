/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f7f8f3',
          100: '#eaeddc',
          200: '#d4ddba',
          300: '#b5c48b',
          400: '#96a85f',
          500: '#7f8d46',
          600: '#657138',
          700: '#4d572e',
          800: '#42492b',
          900: '#383e28',
        },
      },
    },
  },
  plugins: [],
}

