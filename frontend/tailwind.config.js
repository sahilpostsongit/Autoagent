export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#060A0E', surface: '#0D1117', border: '#1A2332',
          green: '#00FF88', cyan: '#00D4FF', amber: '#FFB300',
          red: '#FF3B5C', muted: '#4A6A8A', text: '#C8D8E8'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Orbitron', 'monospace']
      }
    }
  },
  plugins: []
}
