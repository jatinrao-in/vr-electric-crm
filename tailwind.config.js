/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['"Lato"', 'sans-serif'],
      mono: ['"Lato"', 'sans-serif'],
      display: ['"Lato"', 'sans-serif'],
      body: ['"Lato"', 'sans-serif'],
    },
    extend: {
      colors: {
        brand: {
          blue: '#0A3D91',
          navy: '#062463',
          green: '#65B32E',
          forest: '#1B662C',
        },
        primary: {
          DEFAULT: '#0A3D91',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#0A3D91',
          600: '#0A3D91',
          700: '#062463',
          800: '#051B4B',
          900: '#031131',
        },
        action: {
          DEFAULT: '#65B32E',
          hover: '#1B662C',
          50: '#F4FBF0',
          100: '#E7F7E0',
          500: '#65B32E',
          600: '#65B32E',
          700: '#1B662C',
          800: '#134D21',
        },
        background: '#F8FAFC',
        canvas: '#F8FAFC',
        surface: '#FFFFFF',
        border: '#E2E8F0',
        heading: '#111827',
        secondary: '#475569',
        muted: '#64748B',
      },
      fontFamily: {
        sans: ['"Lato"', 'sans-serif'],
        mono: ['"Lato"', 'sans-serif'],
        display: ['"Lato"', 'sans-serif'],
        body: ['"Lato"', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 12px 0 rgba(0, 0, 0, 0.06)',
        'large': '0 12px 32px 0 rgba(0, 0, 0, 0.10)',
        'sheet': '0 -8px 32px 0 rgba(0, 0, 0, 0.08)',
      },
      spacing: {
        'sidebar': '260px',
      }
    },
  },
  plugins: [],
}
