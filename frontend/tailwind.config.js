/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14171F",
        panel: "#1B1F29",
        panel2: "#20242F",
        border: "#2B303C",
        accent: "#6E62F9",
        accent2: "#8B7FFF",
        mint: "#3ED9A0",
        muted: "#8890A4",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.1rem",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};
