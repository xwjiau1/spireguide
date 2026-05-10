/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 杀戮尖塔主题色
        spire: {
          bg: '#1a1a2e',
          card: '#16213e',
          border: '#0f3460',
          accent: '#e94560',
          success: '#00c853',
          warning: '#ffab00',
          text: '#eaeaea',
          muted: '#a0a0a0',
          ironclad: '#c0392b',
          silent: '#2ecc71',
          defect: '#3498db',
          watcher: '#f1c40f',
          necrobinder: '#8e44ad',
          regent: '#e67e22',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
