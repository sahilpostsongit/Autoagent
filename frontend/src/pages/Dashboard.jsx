import Navbar from '../components/Navbar'
import TaskForm from '../components/TaskForm'
import TaskList from '../components/TaskList'
import AgentStream from '../components/AgentStream'
import StatsBar from '../components/StatsBar'

export default function Dashboard() {
  return (
    <div style={{minHeight:'100vh',background:'#060A0E',display:'flex',flexDirection:'column'}}>
      <Navbar />
      <main style={{flex:1,maxWidth:1280,margin:'0 auto',width:'100%',padding:'16px',display:'flex',flexDirection:'column',gap:16}}>
        <StatsBar />
        <div style={{display:'flex',gap:16,flex:1,minHeight:600}}>
          <div style={{display:'flex',flexDirection:'column',gap:16,width:420,flexShrink:0}}>
            <TaskForm />
            <TaskList />
            <div className="panel" style={{padding:'12px 16px'}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#4A6A8A',marginBottom:8}}>
                <span style={{letterSpacing:4}}>{'//'} SYSTEM INFO</span>
                <span><span style={{color:'#00FF88'}}>●</span> ONLINE</span>
              </div>
              {[['Model','claude-sonnet-4'],['Tools','WebSearch · CodeExec · DataAnalyst'],['Backend','FastAPI + PostgreSQL + Redis'],['Stream','WebSocket real-time']].map(([k,v]) => (
                <div key={k} style={{display:'flex',gap:8,fontSize:11,marginBottom:4}}>
                  <span style={{color:'#4A6A8A',width:60,flexShrink:0}}>{k}</span>
                  <span style={{color:'#C8D8E8',opacity:0.7}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column'}}>
            <AgentStream />
          </div>
        </div>
      </main>
      <footer style={{borderTop:'1px solid #1A2332',padding:'8px 16px',display:'flex',justifyContent:'space-between'}}>
        <span style={{color:'#1A2332',fontSize:11,letterSpacing:3}}>AUTOAGENT v1.0 // AUTONOMOUS AI PLATFORM</span>
        <span style={{color:'#1A2332',fontSize:11}}><span style={{color:'#00FF88'}}>●</span> LIVE</span>
      </footer>
    </div>
  )
}
