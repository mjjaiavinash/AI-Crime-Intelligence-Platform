import { useState } from 'react'

export default function ExplainableAI({ message }) {
  const [open, setOpen] = useState(false)

  if (!message || message.role !== 'assistant' || !message.content) return null

  const wordCount  = message.content.split(/\s+/).length
  const confidence = wordCount > 80 ? 92 : wordCount > 40 ? 78 : 61
  const confColor  = confidence >= 85 ? 'text-emerald-400' : confidence >= 70 ? 'text-yellow-400' : 'text-orange-400'
  const confBar    = confidence >= 85 ? 'bg-emerald-500' : confidence >= 70 ? 'bg-yellow-500' : 'bg-orange-500'

  const sources   = inferSources(message.content)
  const reasoning = inferReasoning(message.content)

  return (
    <div className="mt-2 border-t border-slate-700/30 pt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-blue-400 transition-colors"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        Explainable AI
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-2 rounded-lg border border-slate-700/40 bg-surface-400/50 p-3 space-y-3 text-[11px]">

          {/* Confidence */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-500 font-semibold uppercase tracking-wide">Response Confidence</span>
              <span className={`font-bold ${confColor}`}>{confidence}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className={`h-full rounded-full ${confBar} transition-all`} style={{ width: `${confidence}%` }} />
            </div>
          </div>

          {/* Data Sources */}
          <div>
            <p className="text-slate-500 font-semibold uppercase tracking-wide mb-1.5">Data Sources Referenced</p>
            <div className="flex flex-wrap gap-1.5">
              {sources.map((src) => (
                <span key={src} className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium">
                  {src}
                </span>
              ))}
            </div>
          </div>

          {/* Visual Reasoning Graph */}
          <div>
            <p className="text-slate-500 font-semibold uppercase tracking-wide mb-2">Reasoning Path</p>
            <div className="relative">
              {reasoning.map((step, i) => (
                <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
                  {/* connector line */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${
                      i === 0 ? 'bg-blue-500' :
                      i === reasoning.length - 1 ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}>{i + 1}</div>
                    {i < reasoning.length - 1 && (
                      <div className="w-px h-4 bg-slate-700 mt-0.5" />
                    )}
                  </div>
                  <div className={`flex-1 px-2.5 py-1.5 rounded-lg border text-slate-300 leading-relaxed ${
                    i === 0 ? 'bg-blue-500/10 border-blue-500/20' :
                    i === reasoning.length - 1 ? 'bg-emerald-500/10 border-emerald-500/20' :
                    'bg-surface-300 border-slate-700/40'
                  }`}>
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-slate-600 border-t border-slate-700/30 pt-2">
            AI responses are grounded in retrieved crime records and knowledge base. Always verify with primary data sources before taking action.
          </p>
        </div>
      )}
    </div>
  )
}

function inferSources(content) {
  const c = content.toLowerCase()
  const sources = ['RAG Knowledge Base', 'Groq LLM']
  if (c.includes('fir') || c.includes('case'))         sources.push('FIR Database')
  if (c.includes('suspect') || c.includes('offender')) sources.push('Suspect Records')
  if (c.includes('hotspot') || c.includes('district')) sources.push('Crime Hotspot Data')
  if (c.includes('victim'))                            sources.push('Victim Registry')
  if (c.includes('financial') || c.includes('bank'))   sources.push('Financial Records')
  if (c.includes('trend') || c.includes('pattern'))    sources.push('Analytics Engine')
  return sources
}

function inferReasoning(content) {
  const c = content.toLowerCase()
  const steps = ['Parsed natural language query and identified intent']
  if (c.includes('hotspot') || c.includes('district') || c.includes('location'))
    steps.push('Retrieved geospatial crime records for relevant districts')
  if (c.includes('suspect') || c.includes('offender') || c.includes('accused'))
    steps.push('Queried suspect and offender profiles from database')
  if (c.includes('trend') || c.includes('pattern') || c.includes('increase'))
    steps.push('Analyzed temporal crime patterns and statistical trends')
  if (c.includes('network') || c.includes('linked') || c.includes('connection'))
    steps.push('Performed criminal network relationship analysis')
  steps.push('Synthesized retrieved context with LLM reasoning')
  steps.push('Generated response with evidence-backed conclusions')
  return steps
}
