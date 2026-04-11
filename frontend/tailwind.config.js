/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0C10',
        navy: {
          light: '#121826',
          DEFAULT: '#0A0C10',
        },
        accent: {
          violet: '#7C3AED',
          cyan: '#22D3EE',
          green: '#2CB67D',
          amber: '#F59E0B',
        }
      },
      fontFamily: {
        display: ['Clash Display', 'Satoshi', 'Cabinet Grotesk', 'sans-serif'],
        sans: ['General Sans', 'DM Sans', 'sans-serif'],
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(124, 58, 237, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
