import { create } from 'zustand'
import { tasksAPI } from '../api/client'
export const useTaskStore = create((set, get) => ({
  tasks: [], activeTask: null, agentLogs: [], wsConnection: null, loading: false,
  fetchTasks: async () => { try { const { data } = await tasksAPI.list(); set({ tasks: data }) } catch {} },
  createTask: async (goal) => { set({ loading: true }); try { const { data } = await tasksAPI.create({ goal }); set(s => ({ tasks: [data, ...s.tasks], loading: false })); return { ok: true, task: data } } catch (err) { set({ loading: false }); return { ok: false, error: err.response?.data?.detail || 'Failed' } } },
  deleteTask: async (id) => { try { await tasksAPI.delete(id); set(s => ({ tasks: s.tasks.filter(t => t.id !== id) })); return { ok: true } } catch { return { ok: false } } },
  connectToTask: (taskId, token) => { const existing = get().wsConnection; if (existing) existing.close(); set({ activeTask: taskId, agentLogs: [] }); const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'; const ws = new WebSocket(protocol+'://'+window.location.host+'/ws/agent/'+taskId+'?token='+token); ws.onmessage = (e) => { try { const msg = JSON.parse(e.data); set(s => ({ agentLogs: [...s.agentLogs, { ...msg, id: Date.now()+Math.random() }] })); if (msg.type === 'complete' || msg.type === 'error') { set(s => ({ tasks: s.tasks.map(t => t.id === taskId ? { ...t, status: msg.type === 'complete' ? 'COMPLETED' : 'FAILED' } : t) })) } } catch {} }; ws.onclose = () => set({ wsConnection: null }); set({ wsConnection: ws }) },
  clearLogs: () => set({ agentLogs: [], activeTask: null })
}))
