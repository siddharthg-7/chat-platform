/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wa-teal': '#00a884',
        'wa-teal-light': '#008069',
        'wa-bg': '#111b21',
        'wa-panel': '#202c33',
        'wa-panel-hover': '#2a3942',
        'wa-border': '#222d34',
        'wa-msg-in': '#202c33',
        'wa-msg-out': '#005c4b',
        'wa-text': '#e9edef',
        'wa-text-muted': '#8696a0',
      }
    },
  },
  plugins: [],
}
