/** @type {import('tailwindcss').Config} */
const { join } = require('path');

module.exports = {
  content: [join(__dirname, './src/**/*.{html,js,jsx,ts,tsx}')],
  theme: {
    extend: {},
  },
  plugins: [],
};
