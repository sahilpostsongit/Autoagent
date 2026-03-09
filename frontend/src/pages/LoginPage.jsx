import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const { login, register, loading } = useAuthStore()
  const navigate = useNavigate()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mode === 'login') {
      const res = await login(form.username, form.password)
      if (res.ok) { toast.success('ACCESS GRANTED'); navigate('/') }
      else toast.error(res.error)
    } else {
      const res = await register(form.username, form.email, form.password)
      if (res.ok) { toast.success('AGENT REGISTERED — login to proceed'); setMode('login') }
      else toast.error(res.error)
    }
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4" style={{background:'#060A0E'}}>
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-3">
            <div style={{width:8,height:8,borderRadius:'50%',background:'#00FF88'}} />
            <span style={{fontFamily:'Orbitron,monospace',color:'#00FF88',fontSize:22,fontWeight:700,letterSpacing:6,textShadow:'0 0 20px rgba(0,255,136,0.5)'}}>AUTOAGENT</span>
            <div style={{width:8,height:8,borderRadius:'50%',background:'#00FF88'}} />
          </div>
          <p style={{color:'#4A6A8A',fontSize:11,letterSpacing:4}}>AUTONOMOUS AI EXECUTION PLATFORM</p>
        </div>
        <div className="panel">
          <div className="panel-header">
            <div style={{display:'flex',gap:6}}>
              <div style={{width:10,height:10,borderRadius:'50%',background:'#FF3B5C',opacity:0.7}} />
              <div style={{width:10,height:10,borderRadius:'50%',background:'#FFB300',opacity:0.7}} />
              <div style={{width:10,height:10,borderRadius:'50%',background:'#00FF88',opacity:0.7}} />
            </div>
            <span style={{color:'#4A6A8A',fontSize:11,letterSpacing:4,marginLeft:8}}>{mode === 'login' ? 'AUTH :: LOGIN' : 'AUTH :: REGISTER'}</span>
          </div>
          <div style={{padding:24}}>
            <div style={{display:'flex',marginBottom:24,border:'1px solid #1A2332',borderRadius:2,overflow:'hidden'}}>
              {['login','register'].map(m => (
                <button key={m} onClick={() => setMode(m)} style={{flex:1,padding:'8px 0',fontSize:11,letterSpacing:4,textTransform:'uppercase',background:mode===m?'#00FF88':'transparent',color:mode===m?'#060A0E':'#4A6A8A',border:'none',cursor:'pointer',fontFamily:'JetBrains Mono,monospace',fontWeight:mode===m?700:400,transition:'all 0.2s'}}>{m}</button>
              ))}
            </div>
            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
              <div>
                <label style={{display:'block',fontSize:11,color:'#4A6A8A',letterSpacing:4,marginBottom:6}}>&gt; USERNAME</label>
                <input className="terminal-input" style={{width:'100%',padding:'10px 12px',fontSize:13,borderRadius:2}} placeholder="agent_username" value={form.username} onChange={e=>set('username',e.target.value)} required />
              </div>
              {mode === 'register' && (
                <div className="animate-slideUp">
                  <label style={{display:'block',fontSize:11,color:'#4A6A8A',letterSpacing:4,marginBottom:6}}>&gt; EMAIL</label>
                  <input type="email" className="terminal-input" style={{width:'100%',padding:'10px 12px',fontSize:13,borderRadius:2}} placeholder="agent@domain.com" value={form.email} onChange={e=>set('email',e.target.value)} required />
                </div>
              )}
              <div>
                <label style={{display:'block',fontSize:11,color:'#4A6A8A',letterSpacing:4,marginBottom:6}}>&gt; PASSWORD</label>
                <input type="password" className="terminal-input" style={{width:'100%',padding:'10px 12px',fontSize:13,borderRadius:2}} placeholder="••••••••••" value={form.password} onChange={e=>set('password',e.target.value)} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{padding:'12px 0',fontSize:12,borderRadius:2,letterSpacing:4,marginTop:4}}>
                {loading ? 'AUTHENTICATING...' : mode === 'login' ? 'AUTHENTICATE' : 'REGISTER AGENT'}
              </button>
            </form>
            <p style={{textAlign:'center',color:'#4A6A8A',fontSize:11,marginTop:20}}>
              {mode === 'login' ? 'New agent? ' : 'Already registered? '}
              <button onClick={() => setMode(mode==='login'?'register':'login')} style={{color:'#00FF88',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:11,textDecoration:'underline'}}>
                {mode === 'login' ? 'Create account' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
