import axios from 'axios'
const api = axios.create({ baseURL: '/api' })
api.interceptors.request.use(config => { const token = localStorage.getItem('token'); if (token) config.headers.Authorization = Bearer +token; return config })
api.interceptors.response.use(res => res, err => { if (err.response?.status === 401) { localStorage.removeItem('token'); window.location.href = '/login' } return Promise.reject(err) })
export const authAPI = { register: (data) => api.post('/auth/register', data), login: (data) => api.post('/auth/login', data), me: () => api.get('/auth/me') }
export const tasksAPI = { create: (data) => api.post('/tasks/', data), list: () => api.get('/tasks/'), get: (id) => api.get(/tasks/+id), delete: (id) => api.delete(/tasks/+id), uploadData: (file) => { const form = new FormData(); form.append('file', file); return api.post('/tasks/upload-data', form) } }
export default api
