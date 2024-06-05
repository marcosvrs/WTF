/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        "equal-sm": "0 0 2px 0 rgb(0 0 0 / 0.05)",
        equal: "0 0 3px 0 rgb(0 0 0 / 0.1)",
        "equal-md": "0 0 6px -1px rgb(0 0 0 / 0.1)",
        "equal-lg": "0 0 15px -3px rgb(0 0 0 / 0.1)",
        "equal-xl": "0 0 25px -5px rgb(0 0 0 / 0.1)",
        "equal-2xl": "0 0 50px -12px rgb(0 0 0 / 0.25)",
      },
    },
  },
  variants: {
    extend: {
      boxShadow: ["hover", "focus"],
    },
  },
  plugins: [],
};
