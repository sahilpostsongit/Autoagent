import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#0D1117', color: '#C8D8E8', border: '1px solid #1A2332', fontFamily: '"JetBrains Mono", monospace', fontSize: '13px' }, success: { iconTheme: { primary: '#00FF88', secondary: '#060A0E' } }, error: { iconTheme: { primary: '#FF3B5C', secondary: '#060A0E' } } }} />
    </BrowserRouter>
  </React.StrictMode>
)
