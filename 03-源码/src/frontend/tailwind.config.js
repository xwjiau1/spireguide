/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 尖塔智囊设计稿颜色（GitHub风格暗色+橙色强调）
        spire: {
          bg: '#0d1117',
          surface: '#161b22',
          'surface-light': '#1c2128',
          border: '#30363d',
          accent: '#ff7b00',
          'accent-hover': '#ff9933',
          'accent-dim': '#cc6200',
          text: '#e6edf3',
          muted: '#8b949e',
          success: '#58a6ff',
          warning: '#ffab00',
          danger: '#f85149',
          card: '#21262d',
          ironclad: '#c0392b',
          silent: '#2ecc71',
          defect: '#3498db',
          watcher: '#f1c40f',
          necrobinder: '#8e44ad',
          regent: '#e67e22',
        }
      },
      fontFamily: {
        sans: ['"Microsoft YaHei"', '"PingFang SC"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
