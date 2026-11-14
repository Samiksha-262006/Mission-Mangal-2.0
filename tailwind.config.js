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
        mangal: {
          navy: '#070B1F',
          navyLight: '#0E1738',
          copper: '#C8693A',
          orange: '#E8894F',
          blue: '#2E8BFF',
          blueGlow: '#00C2FF',
          gold: '#F2B44C',
          teal: '#10B981',
          amber: '#F59E0B',
          crimson: '#EF4444',
        },
        space: {
          950: '#070B1F',
          900: '#0A112C',
          850: '#0E1738',
          800: '#14204A',
          700: '#1F2F63',
          600: '#344784',
        },
        hud: {
          cyan: '#2E8BFF',
          teal: '#10B981',
          copper: '#C8693A',
          orange: '#E8894F',
          gold: '#F2B44C',
          amber: '#F59E0B',
          crimson: '#EF4444',
        }
      },
      fontFamily: {
        display: ['Orbitron', 'Rajdhani', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'spin-slow': 'spin 18s linear infinite',
        'shake': 'shake 0.5s ease-in-out infinite',
        'glow-mangal': 'glowMangal 2.5s ease-in-out infinite alternate',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        },
        glowMangal: {
          '0%': { boxShadow: '0 0 10px rgba(46, 139, 255, 0.25), 0 0 20px rgba(200, 105, 58, 0.15)' },
          '100%': { boxShadow: '0 0 25px rgba(46, 139, 255, 0.55), 0 0 35px rgba(200, 105, 58, 0.35)' },
        }
      }
    },
  },
  plugins: [],
}
