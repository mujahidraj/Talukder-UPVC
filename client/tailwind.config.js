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
          50: '#f0f5fa',
          100: '#e1ecf4',
          200: '#c3d9ea',
          300: '#94bedc',
          400: '#5f9dca',
          500: '#3a81b7',
          600: '#2a6699', // primary industrial blue
          700: '#23527e',
          800: '#1f4569',
          900: '#1d3a58',
          950: '#13263c', // darkest navy
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
