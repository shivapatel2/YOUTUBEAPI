module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0099ff', // vibrant blue
          dark: '#005fa3',
          light: '#33bfff',
        },
        background: {
          DEFAULT: '#0a0e1a', // deep dark
          dark: '#05070d',
        },
        accent: '#33bfff',
        card: '#101624',
        muted: '#1a2236',
        'primary-foreground': '#ffffff',
        'muted-foreground': '#b3cfff',
        border: {
          DEFAULT: '#22304a', // blue/gray for borders
        },
      },
    },
  },
  plugins: [],
}; 