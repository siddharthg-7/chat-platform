/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        background:  'var(--bg-surface)',
        foreground:  'var(--text)',
        border:      'var(--border)',
        input:       'var(--bg-glass)',
        ring:        'var(--accent)',
        card:        'var(--bg-glass)',

        primary: {
          DEFAULT:    'var(--accent)',
          hover:      'var(--accent-hover)',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT:    'var(--bg-glass)',
          foreground: 'var(--text)',
        },
        muted: {
          DEFAULT:    'var(--bg-glass)',
          foreground: 'var(--text-muted)',
        },
        accent: {
          DEFAULT:    'var(--accent)',
          dim:        'var(--accent-dim)',
          glow:       'var(--accent-glow)',
        },
        panel:    'var(--bg-panel)',
        surface:  'var(--bg-surface)',
        base:     'var(--bg-base)',
      },
      borderColor: {
        DEFAULT: 'var(--border)',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        glow:  '0 0 20px var(--accent-glow), 0 0 60px rgba(99,102,241,0.10)',
        'glow-sm': '0 0 12px var(--accent-glow)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}