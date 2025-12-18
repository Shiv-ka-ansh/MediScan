/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        sapphire: {
          50: '#f1f5f9',
          100: '#e2e8f0',
          200: '#cbd5e1',
          300: '#94a3b8',
          400: '#64748b',
          500: '#475569',
          600: '#334155',
          700: '#1e293b',
          800: '#0f172a',
          900: '#020617',
        },
        electric: {
          cyan: '#06B6D4',
          mint: '#2DD4BF',
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neo': '0 0 20px rgba(6, 118, 212, 0.3)',
        'btn-glow': '0 0 15px rgba(6, 118, 212, 0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'premium-gradient': 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        'mesh-gradient': 'radial-gradient(at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%), radial-gradient(at 100% 0%, rgba(45, 212, 191, 0.1) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
}
