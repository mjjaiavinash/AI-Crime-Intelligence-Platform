/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Base surfaces
        surface: {
          DEFAULT: '#0a0f1e',
          50:  '#0d1426',
          100: '#111827',
          200: '#1a2235',
          300: '#1e2a3d',
          400: '#243047',
        },
        // Primary brand — deep navy
        primary: {
          DEFAULT: '#1e3a5f',
          50:  '#e8f0f9',
          100: '#c5d8ef',
          200: '#9dbde3',
          300: '#6fa0d6',
          400: '#4a88cc',
          500: '#1e3a5f',
          600: '#183252',
          700: '#122844',
          800: '#0c1e35',
          900: '#061426',
        },
        // Accent — alert red
        accent: {
          DEFAULT: '#e63946',
          50:  '#fdecea',
          100: '#f9c5c8',
          200: '#f49ba0',
          300: '#ee6e76',
          400: '#e94d56',
          500: '#e63946',
          600: '#cc2f3b',
          700: '#b0242f',
          800: '#941a23',
          900: '#780f17',
        },
        // Status colors
        success: '#10b981',
        warning: '#f59e0b',
        info:    '#3b82f6',
        // Neutral grays
        slate: {
          750: '#2a3548',
          850: '#141c2e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card:  '0 4px 24px rgba(0,0,0,0.4)',
        glow:  '0 0 20px rgba(30,58,95,0.6)',
        'glow-accent': '0 0 20px rgba(230,57,70,0.4)',
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231e3a5f' fill-opacity='0.15'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-in':   'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn: { from: { opacity: 0, transform: 'translateY(-8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
