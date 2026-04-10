/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#0f172a', light: '#1e293b', dark: '#020617' },
        accent:    { DEFAULT: '#f97316', light: '#fb923c', dark: '#ea580c' },
        surface:   { DEFAULT: '#ffffff', alt: '#f8fafc', dark: '#f1f5f9' },
        muted:     '#94a3b8',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card:    '0 2px 16px rgba(0,0,0,0.06)',
        cardHov: '0 8px 32px rgba(0,0,0,0.12)',
        nav:     '0 1px 0 rgba(0,0,0,0.08)',
      },
      borderRadius: {
        xl2: '1.25rem',
        xl3: '1.5rem',
      },
      animation: {
        'fade-in':   'fadeIn 0.4s ease forwards',
        'slide-up':  'slideUp 0.4s ease forwards',
        'skeleton':  'skeleton 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 },              to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        skeleton:{ '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
      },
    },
  },
  plugins: [],
};
