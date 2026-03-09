import { create } from 'zustand'
import { authAPI } from '../api/client'
export const useAuthStore = create((set) => ({
  user: null, token: localStorage.getItem('token'), loading: false, initialized: false,
  init: async () => { const token = localStorage.getItem('token'); if (!token) { set({ initialized: true }); return } try { const { data } = await authAPI.me(); set({ user: data, token, initialized: true }) } catch { localStorage.removeItem('token'); set({ user: null, token: null, initialized: true }) } },
  login: async (username, password) => { set({ loading: true }); try { const { data } = await authAPI.login({ username, password }); localStorage.setItem('token', data.access_token); const me = await authAPI.me(); set({ token: data.access_token, user: me.data, loading: false }); return { ok: true } } catch (err) { set({ loading: false }); return { ok: false, error: err.response?.data?.detail || 'Login failed' } } },
  register: async (username, email, password) => { set({ loading: true }); try { await authAPI.register({ username, email, password }); set({ loading: false }); return { ok: true } } catch (err) { set({ loading: false }); return { ok: false, error: err.response?.data?.detail || 'Registration failed' } } },
  logout: () => { localStorage.removeItem('token'); set({ user: null, token: null }) }
}))
