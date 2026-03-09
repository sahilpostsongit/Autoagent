import { useEffect, useRef } from 'react'
import { useTaskStore } from '../store/taskStore'

const TYPE_CONFIG = {
  thinking:  { label:'THINKING',  color:'#00D4FF', border:'#00D4FF' },
  tool_call: { label:'TOOL CALL', color:'#FFB300', border:'#FFB300' },
  result:    { label:'RESULT',    color:'#00FF88', border:'#00FF88' },
  complete:  { label:'COMPLETE',  color:'#00FF88', border:'#00FF88' },
  error:     { label:'ERROR',     color:'#FF3B5C', border:'#FF3B5C' },
  status:    { label:'STATUS',    color:'#4A6A8A', border:'#1A2332' },
}

export default function AgentStream() {
  const { agentLogs, activeTask, clearLogs, wsConnection } = useTaskStore()
  const bottomRef = useRef()
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [agentLogs])
  const isRunning = wsConnection && wsConnection.readyState === WebSocket.OPEN

  return (
    <div className="panel" style={{display:'flex',flexDirection:'column',height:'100%',minHeight:500}}>
      <div className="panel-header" style={{justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{color:'#00FF88',fontSize:12}}>⬡</span>
          <span style={{color:'#C8D8E8',fontSize:11,letterSpacing:4,fontWeight:600}}>AGENT STREAM</span>
          {activeTask && <span style={{color:'#4A6A8A',fontSize:11}}>:: TASK #{activeTask}</span>}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          {isRunning && <span style={{color:'#00D4FF',fontSize:10,letterSpacing:3}}>● RUNNING</span>}
          {agentLogs.length > 0 && <button onClick={clearLogs} style={{background:'none',border:'none',color:'#4A6A8A',cursor:'pointer',fontSize:10,letterSpacing:2,fontFamily:'JetBrains Mono,monospace'}} onMouseEnter={e=>e.target.style.color='#FF3B5C'} onMouseLeave={e=>e.target.style.color='#4A6A8A'}>CLEAR</button>}
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:12,display:'flex',flexDirection:'column',gap:6,minHeight:0}}>
        {agentLogs.length === 0 ? (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',textAlign:'center',padding:40}}>
            <div style={{width:48,height:48,border:'1px solid #1A2332',borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16,opacity:0.4,fontSize:20}}>⬡</div>
            <p style={{color:'#4A6A8A',fontSize:11,letterSpacing:3}}>AWAITING MISSION DISPATCH</p>
            <p style={{color:'#1A2332',fontSize:11,marginTop:6}}>{'//'} Submit a task to see live agent execution</p>
          </div>
        ) : agentLogs.map((log, i) => {
          const cfg = TYPE_CONFIG[log.type] || TYPE_CONFIG.status
          return (
            <div key={log.id} className="log-line" style={{borderLeftColor:cfg.border,background:'#060A0E',borderRadius:2,padding:'8px 10px',animationDelay:i*20+'ms'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                <span style={{fontSize:10,fontWeight:700,letterSpacing:3,color:cfg.color}}>{cfg.label}</span>
                {log.tool && <span style={{color:'#1A2332',fontSize:10}}>:: {log.tool}</span>}
                <span style={{color:'#1A2332',fontSize:10,marginLeft:'auto'}}>{new Date().toLocaleTimeString('en-US',{hour12:false})}</span>
              </div>
              <p style={{color:'#C8D8E8',fontSize:12,lineHeight:1.6,wordBreak:'break-word',whiteSpace:'pre-wrap'}}>{log.content||log.message||log.result||JSON.stringify(log)}</p>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {agentLogs.length > 0 && (
        <div style={{flexShrink:0,borderTop:'1px solid #1A2332',padding:'6px 14px',display:'flex',gap:16}}>
          <span style={{color:'#4A6A8A',fontSize:10}}>{agentLogs.length} events</span>
          <span style={{color:'#1A2332',fontSize:10}}>|</span>
          <span style={{color:'#4A6A8A',fontSize:10}}>{agentLogs.filter(l=>l.type==='tool_call').length} tool calls</span>
        </div>
      )}
    </div>
  )
}
