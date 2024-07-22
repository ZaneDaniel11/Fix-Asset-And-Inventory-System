/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        MainColor: "#001d22",
        BlackNgadiliBlack: "#0c0c0c",
      },
    },
  },
  plugins: [],
};
