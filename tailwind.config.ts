import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'cursive'],
        'sans': ['"VT323"', 'monospace', 'system-ui'],
      },
      gridTemplateColumns: {
        '30': 'repeat(30, minmax(0, 1fr))',
      },
      boxShadow: {
        'pixel': '3px 3px 0px rgba(0, 0, 0, 0.2)',
        'glow-light': '0 0 10px rgba(255, 165, 0, 0.5)',
        'glow-dark': '0 0 10px rgba(255, 77, 0, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;