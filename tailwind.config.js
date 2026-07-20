import daisyui from 'daisyui';

export default {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        'brand-green': '#108e50',
        'brand-red': '#e11d48',
        'dark-blue': '#1b305b',
        'sky-600': '#0284c7',
        'amber-600': '#d97706',
        'react-blue': '#61DAFB',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in-fast': 'fadeIn 0.2s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-slow': 'fadeIn 0.4s ease-out',
        'spin-slow': 'spin 10s linear infinite',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["light"],
    base: false,
  },
};
