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
        brand: {
          DEFAULT: '#14213D',
          hover: '#0E172B',
          light: '#1F3158',
          dark: '#0B1221',
        },
        accent: {
          DEFAULT: '#FCA311',
          hover: '#E5920B',
          light: '#FDB642',
          subtle: '#FFF6E8',
        },
        match: {
          DEFAULT: '#2EC4B6',
          hover: '#26A69A',
          subtle: '#E8FAF8',
          dark: '#1D8379'
        },
        bg: {
          light: '#F8F9FC',
          dark: '#0C121E',
          cardLight: '#FFFFFF',
          cardDark: '#131C2E',
          subtleDark: '#1A253D',
        },
        ink: {
          heading: '#14213D',
          body: '#5B6472',
          muted: '#8D96A5',
          headingDark: '#F1F5F9',
          bodyDark: '#94A3B8',
          mutedDark: '#64748B'
        },
        border: {
          light: '#E5E8EF',
          dark: '#24334F'
        }
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'brand': '7px',
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(20, 33, 61, 0.05), 0 1px 2px -1px rgba(20, 33, 61, 0.05)',
        'card': '0 4px 6px -1px rgba(20, 33, 61, 0.06), 0 2px 4px -2px rgba(20, 33, 61, 0.04)',
        'elevated': '0 10px 15px -3px rgba(20, 33, 61, 0.08), 0 4px 6px -4px rgba(20, 33, 61, 0.04)',
        'accent-glow': '0 0 0 3px rgba(252, 163, 17, 0.35)',
      }
    },
  },
  plugins: [],
};
