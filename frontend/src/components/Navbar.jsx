import { useAuthStore } from '../store/authStore'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  return (
    <header style={{borderBottom:'1px solid #1A2332',background:'#0D1117',position:'sticky',top:0,zIndex:50}}>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'0 16px',height:48,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{display:'flex',gap:3}}>
            {[1,0.6,0.3].map((o,i) => <div key={i} style={{width:3,height:16,background:'#00FF88',opacity:o,borderRadius:2}} />)}
          </div>
          <span style={{fontFamily:'Orbitron,monospace',color:'#00FF88',fontSize:13,fontWeight:700,letterSpacing:5,textShadow:'0 0 20px rgba(0,255,136,0.5)'}}>AUTOAGENT</span>
          <span style={{color:'#1A2332',fontSize:12}}>|</span>
          <span style={{color:'#4A6A8A',fontSize:11,letterSpacing:3}}>AUTONOMOUS EXECUTION PLATFORM</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'#00FF88'}} />
            <span style={{color:'#00FF88',fontSize:11,letterSpacing:3}}>ONLINE</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,borderLeft:'1px solid #1A2332',paddingLeft:16}}>
            <span style={{color:'#C8D8E8',fontSize:12}}>{user?.username}</span>
            <button onClick={logout} style={{background:'none',border:'none',color:'#4A6A8A',cursor:'pointer',fontSize:11,letterSpacing:2,fontFamily:'JetBrains Mono,monospace'}} onMouseEnter={e=>e.target.style.color='#FF3B5C'} onMouseLeave={e=>e.target.style.color='#4A6A8A'}>LOGOUT</button>
          </div>
        </div>
      </div>
    </header>
  )
}
