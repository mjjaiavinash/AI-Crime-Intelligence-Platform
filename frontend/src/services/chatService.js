import api from './api'

// ── RAG Chat (streaming handled directly in ChatPage via fetch) ───────────────
// Streaming requires raw fetch with ReadableStream, not axios.
// This service handles non-streaming AI calls.

// ── AI Assistant ──────────────────────────────────────────────────────────────
export const getCaseSummary      = (firId)      => api.get(`/assistant/case-summary/${firId}`)
export const getCaseTimeline     = (firId)      => api.get(`/assistant/timeline/${firId}`)
export const getSuspectProfile   = (suspectId)  => api.get(`/assistant/suspect-profile/${suspectId}`)

// ── ML Predictions ────────────────────────────────────────────────────────────
export const predictHotspot         = (data) => api.post('/ml/predict-hotspot', data)
export const predictRepeatOffender  = (data) => api.post('/ml/predict-repeat-offender', data)
export const classifyCrime          = (data) => api.post('/ml/classify-crime', data)

// ── Legacy ML ─────────────────────────────────────────────────────────────────
export const getMLHotspots    = ()          => api.get('/ml/hotspots')
export const getMLAnomalies   = ()          => api.get('/ml/anomalies')
export const getRiskScore     = (suspectId) => api.get(`/ml/risk-score/${suspectId}`)
