import { useTaskStore } from '../store/taskStore'

export default function StatsBar() {
  const tasks = useTaskStore(s => s.tasks)
  const stats = [
    { label: 'TOTAL',     value: tasks.length,                                  color: '#C8D8E8' },
    { label: 'RUNNING',   value: tasks.filter(t=>t.status==='RUNNING').length,   color: '#00D4FF' },
    { label: 'COMPLETED', value: tasks.filter(t=>t.status==='COMPLETED').length, color: '#00FF88' },
    { label: 'FAILED',    value: tasks.filter(t=>t.status==='FAILED').length,    color: '#FF3B5C' },
  ]
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
      {stats.map(({label,value,color}) => (
        <div key={label} className="panel" style={{padding:'12px 16px'}}>
          <div style={{fontFamily:'Orbitron,monospace',fontSize:22,fontWeight:700,color,marginBottom:4}}>{value}</div>
          <div style={{fontSize:10,color:'#4A6A8A',letterSpacing:3}}>{label}</div>
        </div>
      ))}
    </div>
  )
}
