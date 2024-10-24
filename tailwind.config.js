const { subtle } = require('crypto');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          2: 'var(--primary2)',
          3: 'var(--primary3)',
          4: 'var(--primary4)',
          5: 'var(--primary5)',
          6: 'var(--primary6)',
          '6_1': 'var(--primary6_1)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        primary6: {
          DEFAULT: 'var(--primary6)',
          foreground: 'var(--primary6-foreground)',
        },
        primary5: {
          DEFAULT: 'var(--primary5)',
          foreground: 'var(--primary5-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        chart: {
          1: 'var(--chart-1)',
          2: 'var(--chart-2)',
          3: 'var(--chart-3)',
          4: 'var(--chart-4)',
          5: 'var(--chart-5)',
        },
        error: {
          DEFAULT: 'var(--error)',
          2: 'var(--error2)',
          3: 'var(--error3)',
        },
        info: {
          DEFAULT: 'var(--info)',
          2: 'var(--info2)',
          3: 'var(--info3)',
        },
        success: {
          DEFAULT: 'var(--success)',
          2: 'var(--success2)',
          3: 'var(--success3)',
        },
        text: {
          DEFAULT: 'var(--text)',
          2: 'var(--text2)',
          3: 'var(--text3)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          2: 'var(--warning2)',
          3: 'var(--warning3)',
        },
      },
      borderRadius: {
        sm: 'var(--radius)',
        md: 'calc(var(--radius) * 2)',
        lg: 'calc(var(--radius) * 3)',
      },
      boxShadow: {
        DEFAULT: 'var(--boxShadow)',
        2: 'var(--boxShadow2)',
        3: 'var(--boxShadow3)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
