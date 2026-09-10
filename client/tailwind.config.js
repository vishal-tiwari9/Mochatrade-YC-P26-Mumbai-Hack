/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0a0e17',
          darker: '#06090e',
          card: '#111827',
          cardBorder: '#1f293d',
          accent: '#38bdf8',
          emerald: '#10b981',
          amber: '#f59e0b',
          orange: '#f97316',
          crimson: '#ef4444',
          purple: '#a855f7'
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.8', filter: 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.6))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 24px rgba(239, 68, 68, 0.9))' }
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        }
      }
    },
  },
  plugins: [],
}
