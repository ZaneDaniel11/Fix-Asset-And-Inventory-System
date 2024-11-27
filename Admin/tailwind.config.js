// tailwind.config.js
module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        MainColor: "#001d22",
        BlackNgadiliBlack: "#0c0c0c",
      },
    },
  },
  variants: {
    extend: { scrollbar: ["rounded"] },
  },
  plugins: [],
};
