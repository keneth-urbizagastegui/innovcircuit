/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(0 0% 90%)',
        background: '#ffffff',
        foreground: '#0f172a', // slate-900
        primary: {
          DEFAULT: '#0d9488', // teal-600 (Tindie Green)
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f97316', // orange-500 (Tindie Orange)
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#dc2626', // red-600
          foreground: '#ffffff',
        },
        success: {
          DEFAULT: '#059669', // emerald-600
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f1f5f9', // slate-100
          foreground: '#64748b', // slate-500
        },
      },
      borderRadius: {
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
}