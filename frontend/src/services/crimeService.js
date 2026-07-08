// API calls for crime CRUD operations
import api from './api'

export const getCrimes = (params) => api.get('/crimes', { params })
export const getCrimeById = (id) => api.get(`/crimes/${id}`)
export const createCrime = (data) => api.post('/crimes', data)
export const updateCrime = (id, data) => api.put(`/crimes/${id}`, data)
export const deleteCrime = (id) => api.delete(`/crimes/${id}`)
