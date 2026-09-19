/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          50: '#f4f4f5',
          100: '#e4e4e7',
          200: '#d4d4d8',
          300: '#a1a1aa',
          400: '#71717a',
          500: '#52525b',
          600: '#27272a',
          700: '#18181b',
          800: '#09090b',
          900: '#000000',
          950: '#000000',
        },
        indigo: {
          50: '#f4f4f5',
          100: '#e4e4e7',
          200: '#d4d4d8',
          300: '#a1a1aa',
          400: '#71717a',
          500: '#52525b',
          600: '#27272a',
          700: '#18181b',
          800: '#09090b',
          900: '#000000',
          950: '#000000',
        },
        violet: {
          50: '#f4f4f5',
          100: '#e4e4e7',
          200: '#d4d4d8',
          300: '#a1a1aa',
          400: '#71717a',
          500: '#52525b',
          600: '#27272a',
          700: '#18181b',
          800: '#09090b',
          900: '#000000',
          950: '#000000',
        },
        skygrid: {
          bg: '#09090b',
          dark: '#000000',
          purple: '#18181b',
          purpleDark: '#09090b',
          violet: '#27272a',
          violetSoft: '#f4f4f5',
          cyan: '#71717a',
          green: '#52525b',
          amber: '#a1a1aa',
          panel: '#ffffff',
          line: '#e4e4e7',
          surface: '#ffffff',
          surfaceMuted: '#f4f4f5',
          ink: '#09090b',
          muted: '#71717a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'skygrid': '0 18px 48px rgba(0, 0, 0, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
        'glow': '0 0 25px rgba(255, 255, 255, 0.15)'
      }
    },
  },
  plugins: [],
}
