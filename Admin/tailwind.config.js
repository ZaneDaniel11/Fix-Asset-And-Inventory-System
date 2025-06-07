// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
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
        background: "hsl(var(--background))", // ✅ Add this
        foreground: "hsl(var(--foreground))", // ✅ Add this
        border: "hsl(var(--border))",
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
