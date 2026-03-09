import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'

function PrivateRoute({ children }) {
  const { token, initialized } = useAuthStore()
  if (!initialized) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#00FF88',fontFamily:'monospace',fontSize:'13px'}}>INITIALIZING...</div>
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  const init = useAuthStore(s => s.init)
  useEffect(() => { init() }, [init])
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
