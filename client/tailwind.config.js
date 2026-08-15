/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef0f8',
          100: '#d5daea',
          200: '#aab5d6',
          300: '#7e8fc1',
          400: '#5369ac',
          500: '#3a4e8f',
          600: '#2a3a72', // primary navy
          700: '#1f2d5e',
          800: '#1b2a6b', // logo navy exact
          900: '#141f50',
          950: '#0d1433', // darkest
        },
        accent: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#f89a9a',
          400: '#ef5555',
          500: '#e63232',
          600: '#d42027', // logo red exact
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
