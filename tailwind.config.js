/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        sea: {
          50: '#eefafa',
          100: '#d9f1f1',
          300: '#9ad9dc',
          500: '#5dbcc5',
          700: '#327d86'
        },
        linen: '#fff7ec',
        coral: '#f0a28b',
        ink: '#1b2a31',
        glass: {
          light: 'rgba(255, 255, 255, 0.26)',
          dark: 'rgba(16, 30, 36, 0.42)'
        }
      },
      borderRadius: {
        ios: '22px',
        'ios-lg': '28px'
      },
      boxShadow: {
        glass: '0 18px 60px rgba(42, 105, 118, 0.16)',
        'glass-hover': '0 28px 90px rgba(42, 105, 118, 0.24)'
      },
      transitionTimingFunction: {
        ios: 'cubic-bezier(0.22, 1, 0.36, 1)',
        press: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
      }
    }
  },
  plugins: []
}
