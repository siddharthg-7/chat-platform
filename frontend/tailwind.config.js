/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Your new unique brand layout palette!
        brand: {
          bg: '#0f172a',        // Deep slate background
          panel: '#1e293b',     // Smooth panel background
          accent: '#6366f1',    // Vibrant Indigo for active tabs/buttons
          accentHover: '#4f46e5',
          text: '#f8fafc',      // Crisp white text
          muted: '#94a3b8',     // Muted gray for timestamps
          bubbleIn: '#334155',  // Received message bubble
          bubbleOut: '#4f46e5', // Sent message bubble
        }
      } 
    }
  },
  plugins: [],
}