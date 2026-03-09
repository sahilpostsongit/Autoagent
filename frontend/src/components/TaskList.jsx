import { useEffect } from 'react'
import { useTaskStore } from '../store/taskStore'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const STATUS = { PENDING:{label:'PENDING',color:'#FFB300'}, RUNNING:{label:'RUNNING',color:'#00D4FF'}, COMPLETED:{label:'DONE',color:'#00FF88'}, FAILED:{label:'FAILED',color:'#FF3B5C'} }

export default function TaskList() {
  const { tasks, fetchTasks, deleteTask, connectToTask } = useTaskStore()
  const { token } = useAuthStore()

  useEffect(() => { fetchTasks(); const i = setInterval(fetchTasks, 5000); return () => clearInterval(i) }, [])

  const handleDelete = async (id) => { const res = await deleteTask(id); if (res.ok) toast.success('Task removed'); else toast.error('Delete failed') }
  const handleConnect = (id) => { connectToTask(id, token); toast.success('Watching task #'+id) }

  return (
    <div className="panel">
      <div className="panel-header" style={{justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{color:'#00FF88',fontSize:12}}>☰</span>
          <span style={{color:'#C8D8E8',fontSize:11,letterSpacing:4,fontWeight:600}}>MISSION HISTORY</span>
        </div>
        <span style={{color:'#4A6A8A',fontSize:11}}>{tasks.length} total</span>
      </div>
      <div style={{overflowY:'auto',maxHeight:260}}>
        {tasks.length === 0 ? (
          <div style={{padding:'32px 16px',textAlign:'center'}}>
            <p style={{color:'#4A6A8A',fontSize:11,letterSpacing:3}}>NO MISSIONS YET</p>
          </div>
        ) : tasks.map(task => {
          const cfg = STATUS[task.status] || STATUS.PENDING
          return (
            <div key={task.id} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 14px',borderBottom:'1px solid #1A233240',transition:'background 0.2s'}} onMouseEnter={e=>e.currentTarget.style.background='#1A233220'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={{flexShrink:0,paddingTop:2,width:8,height:8,borderRadius:'50%',background:cfg.color,marginTop:4}} />
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',gap:8,marginBottom:3}}>
                  <span style={{color:'#4A6A8A',fontSize:11}}>#{task.id}</span>
                  <span style={{fontSize:10,letterSpacing:3,color:cfg.color}}>{cfg.label}</span>
                </div>
                <p style={{color:'#C8D8E8',fontSize:11,lineHeight:1.5,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{task.goal}</p>
              </div>
              <div style={{flexShrink:0,display:'flex',gap:4}}>
                {(task.status==='PENDING'||task.status==='RUNNING') && <button onClick={()=>handleConnect(task.id)} style={{background:'none',border:'none',color:'#00D4FF',cursor:'pointer',fontSize:13,padding:'2px 4px'}} title="Watch">▶</button>}
                <button onClick={()=>handleDelete(task.id)} style={{background:'none',border:'none',color:'#4A6A8A',cursor:'pointer',fontSize:13,padding:'2px 4px'}} onMouseEnter={e=>e.target.style.color='#FF3B5C'} onMouseLeave={e=>e.target.style.color='#4A6A8A'} title="Delete">✕</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
