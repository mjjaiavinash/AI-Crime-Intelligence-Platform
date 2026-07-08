// API calls for login and token management
import api from './api'

export const login = (credentials) => api.post('/auth/login', credentials)
export const logout = () => localStorage.removeItem('token')
export const getMe = () => api.get('/auth/me')
