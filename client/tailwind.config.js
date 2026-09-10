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
        dark: {
          950: '#070A13',
          900: '#0D1322',
          850: '#111A30',
          800: '#17223D',
          700: '#23335A',
          600: '#344778',
        },
        cyber: {
          cyan: '#06B6D4',
          blue: '#3B82F6',
          indigo: '#6366F1',
          purple: '#A855F7',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          crimson: '#EF4444',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flow-glow': 'flowGlow 2s ease-in-out infinite',
      },
      keyframes: {
        flowGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'drop-shadow(0 0 4px #06B6D4)' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 12px #3B82F6)' },
        }
      }
    },
  },
  plugins: [],
}
