// API calls for analytics data (hotspots, trends, network graph)
import api from './api'

export const getHotspots = () => api.get('/analytics/hotspots')
export const getTrends = (params) => api.get('/analytics/trends', { params })
export const getNetworkGraph = () => api.get('/analytics/network')
