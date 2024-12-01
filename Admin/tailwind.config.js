// tailwind.config.js
module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
        opensans: ['"Open Sans"', "sans-serif"],
        lato: ["Lato", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        raleway: ["Raleway", "sans-serif"],
        nunito: ["Nunito", "sans-serif"],
        ubuntu: ["Ubuntu", "sans-serif"],
        merriweather: ["Merriweather", "serif"],
        playfair: ['"Playfair Display"', "serif"],
      },
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
