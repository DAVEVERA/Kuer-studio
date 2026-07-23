import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#008081',
        panel: '#C0C0C0',
        foreground: '#000000',
        muted: '#7F7F7F',
        accent: '#000080',
        'accent-hover': '#000080',
        'deep-blue': '#000080',
        peach: '#DFDFDF',
        border: '#7F7F7F',
        'border-hover': '#000000',
      },
      fontFamily: {
        sans: ['"MS Sans Serif"', 'Tahoma', 'Arial', 'sans-serif'],
        mono: ['"Courier New"', 'monospace'],
      },
      borderRadius: {
        lg: '0',
        md: '0',
        sm: '0',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(224, 120, 86, 0)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(224, 120, 86, 0.15)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
