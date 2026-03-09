import { useState, useRef } from 'react'
import { useTaskStore } from '../store/taskStore'
import { useAuthStore } from '../store/authStore'
import { tasksAPI } from '../api/client'
import toast from 'react-hot-toast'

const EXAMPLES = ['Research the latest advances in transformer architectures','Analyze the uploaded CSV and find top 5 trends','Write and execute Python code to calculate fibonacci to 1000','Search for current AI startup funding trends and summarize']

export default function TaskForm() {
  const [goal, setGoal] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const fileRef = useRef()
  const { createTask, connectToTask, loading } = useTaskStore()
  const { token } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!goal.trim()) return
    const res = await createTask(goal.trim())
    if (res.ok) { toast.success('TASK #'+res.task.id+' DISPATCHED'); connectToTask(res.task.id, token); setGoal(''); setUploadedFile(null) }
    else toast.error(res.error)
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try { await tasksAPI.uploadData(file); setUploadedFile(file.name); toast.success('FILE LOADED: '+file.name) }
    catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <span style={{color:'#00FF88',fontSize:12}}>⚡</span>
        <span style={{color:'#C8D8E8',fontSize:11,letterSpacing:4,fontWeight:600}}>NEW MISSION</span>
      </div>
      <div style={{padding:16}}>
        <form onSubmit={handleSubmit}>
          <div style={{position:'relative'}}>
            <span style={{position:'absolute',left:10,top:10,color:'#00FF88',fontSize:13,userSelect:'none'}}>$</span>
            <textarea className="terminal-input" style={{width:'100%',paddingLeft:24,paddingRight:10,paddingTop:10,paddingBottom:10,fontSize:12,borderRadius:2,resize:'none'}} rows={3} placeholder="Describe your mission objective... (Ctrl+Enter to submit)" value={goal} onChange={e=>setGoal(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey))handleSubmit(e)}} />
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,marginTop:10}}>
            <input ref={fileRef} type="file" accept=".csv,.json,.xlsx,.xls" style={{display:'none'}} onChange={handleFile} />
            <button type="button" onClick={()=>fileRef.current.click()} disabled={uploading} className="btn-secondary" style={{padding:'6px 12px',fontSize:11,borderRadius:2,letterSpacing:2}}>
              📁 {uploading?'UPLOADING...':uploadedFile?uploadedFile.slice(0,12)+'...':'DATA FILE'}
            </button>
            <div style={{flex:1}} />
            <span style={{color:'#1A2332',fontSize:10,letterSpacing:2}}>ctrl+↵</span>
            <button type="submit" disabled={!goal.trim()||loading} className="btn-primary" style={{padding:'6px 16px',fontSize:11,borderRadius:2,letterSpacing:3}}>
              ▶ EXECUTE
            </button>
          </div>
        </form>
        <div style={{marginTop:14,borderTop:'1px solid #1A2332',paddingTop:12}}>
          <p style={{color:'#4A6A8A',fontSize:10,letterSpacing:3,marginBottom:8}}>{'//'} EXAMPLE MISSIONS</p>
          {EXAMPLES.map((eg,i) => (
            <button key={i} onClick={()=>setGoal(eg)} style={{display:'block',width:'100%',textAlign:'left',fontSize:11,color:'#4A6A8A',background:'none',border:'none',cursor:'pointer',padding:'3px 0',fontFamily:'JetBrains Mono,monospace',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',transition:'color 0.2s'}} onMouseEnter={e=>e.target.style.color='#00FF88'} onMouseLeave={e=>e.target.style.color='#4A6A8A'}>
              <span style={{color:'#1A2332',marginRight:6}}>{i+1}.</span>{eg}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
