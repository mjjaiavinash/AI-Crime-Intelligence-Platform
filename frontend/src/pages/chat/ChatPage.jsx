import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import useAuthStore from '@/store/authStore'
import Spinner from '@/components/common/Spinner'
import ExplainableAI from '@/components/common/ExplainableAI'
import { exportChatToPDF } from '@/utils/exportPDF'

const SUGGESTED = [
  'What are the top crime hotspots in Karnataka?',
  'Who are the repeat offenders with high threat level in Bengaluru?',
  'Summarize recent cyber crime patterns in Karnataka',
  'Which districts have the highest vehicle theft rate?',
  'ಕರ್ನಾಟಕದಲ್ಲಿ ಇತ್ತೀಚಿನ ಅಪರಾಧ ಪ್ರವೃತ್ತಿಗಳನ್ನು ತೋರಿಸಿ',
]

function useSpeechRecognition(onResult) {
  const recogRef = useRef(null)
  const [listening, setListening] = useState(false)

  const start = (lang = 'en-IN') => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { toast.error('Speech recognition not supported in this browser.'); return }
    const r = new SR()
    r.lang = lang
    r.continuous = false
    r.interimResults = false
    r.onresult = (e) => onResult(e.results[0][0].transcript)
    r.onerror  = () => { setListening(false); toast.error('Microphone error.') }
    r.onend    = () => setListening(false)
    recogRef.current = r
    r.start()
    setListening(true)
  }

  const stop = () => { recogRef.current?.stop(); setListening(false) }
  return { listening, start, stop }
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary-300 transition-colors">
      {copied
        ? <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied</>
        : <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
      }
    </button>
  )
}

export default function ChatPage() {
  const token = useAuthStore((s) => s.token)
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [lang,     setLang]     = useState('en')
  const [autoTTS,  setAutoTTS]  = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  const { listening, start: startSTT, stop: stopSTT } = useSpeechRecognition((text) => {
    setInput(text)
    inputRef.current?.focus()
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const detectLang = (text) => /[\u0C80-\u0CFF]/.test(text) ? 'kn' : 'en'

  const speakText = async (text) => {
    try {
      const fd = new FormData()
      fd.append('text', text.slice(0, 500))
      fd.append('lang', detectLang(text))
      const res = await fetch('/api/v1/voice/tts', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      if (!res.ok) return
      const audio = new Audio(URL.createObjectURL(await res.blob()))
      audio.play()
    } catch { /* non-critical */ }
  }

  const sendMessage = async (text) => {
    const query = (text || input).trim()
    if (!query) return
    setInput('')

    const userMsg = { role: 'user', content: query }
    const history = [...messages, userMsg]
    setMessages(history)
    setLoading(true)

    try {
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          query,
          chat_history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      if (!res.ok) throw new Error()

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      setMessages([...history, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setMessages([...history, { role: 'assistant', content: full }])
      }

      if (autoTTS && full) speakText(full)
    } catch {
      toast.error('Chat failed. Check backend connection.')
      setMessages(history)
    } finally {
      setLoading(false)
    }
  }

  const fileRef = useRef(null)

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    toast.loading('Uploading document...', { id: 'upload' })
    try {
      const res = await fetch('/api/v1/chat/ingest', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      if (!res.ok) throw new Error()
      toast.success('Document ingested into AI knowledge base!', { id: 'upload' })
    } catch {
      toast.error('Upload failed.', { id: 'upload' })
    }
    e.target.value = ''
  }

  const handleExportPDF = () => {
    if (!messages.length) { toast.error('No conversation to export.'); return }
    exportChatToPDF(messages, 'CrimeIQ Intelligence Chat')
    toast.success('Chat exported as PDF.')
  }

  return (
    <div className="flex flex-col max-w-5xl mx-auto" style={{ height: 'calc(100vh - 2rem)' }}>

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 mb-2 border-b border-slate-700/50 shrink-0">
        <div className="flex items-center gap-3 -ml-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-semibold text-white bg-surface-300 hover:bg-primary-500 border border-slate-600 hover:border-primary-500 px-3 py-1.5 rounded-lg transition-colors shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div>
            <p className="text-base font-bold text-white">AI Crime Intelligence Chat</p>

          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select className="input text-xs py-1.5 w-28" value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="en">English</option>
            <option value="kn">ಕನ್ನಡ</option>
          </select>

          <button onClick={() => setAutoTTS((v) => !v)} title="Toggle auto-speak"
            className={`p-2 rounded-lg border transition-colors ${autoTTS ? 'bg-primary-500/20 border-primary-500/40 text-primary-300' : 'border-slate-700 text-slate-500 hover:text-slate-300'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072" />
            </svg>
          </button>

          <button onClick={handleExportPDF} className="btn-ghost text-xs flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export PDF
          </button>

          {messages.length > 0 && (
            <button onClick={() => setMessages([])} className="btn-ghost text-xs text-slate-500">Clear</button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pt-2 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-accent-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold mb-1">Ask anything about crime data</p>
              <p className="text-xs text-slate-500">Supports English and Kannada · Hold mic button to speak</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTED.map((s) => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="text-left text-xs px-4 py-2.5 rounded-lg bg-surface-300 border border-slate-700/50 text-slate-400 hover:text-white hover:border-primary-500/40 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed
              ${msg.role === 'user'
                ? 'bg-primary-500/20 border border-primary-500/30 text-white rounded-tr-sm'
                : 'bg-surface-300 border border-slate-700/50 text-slate-300 rounded-tl-sm'}`}>
              {msg.role === 'assistant'
                ? (
                  <div className="prose prose-invert prose-sm max-w-none
                    prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5
                    prose-headings:text-white prose-headings:font-semibold
                    prose-code:text-accent-300 prose-code:bg-surface-400 prose-code:px-1 prose-code:rounded
                    prose-pre:bg-surface-400 prose-pre:border prose-pre:border-slate-700/50">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )
                : msg.content
              }
              {msg.role === 'assistant' && msg.content && (
                <div className="mt-2 flex items-center gap-3 border-t border-slate-700/30 pt-2">
                  <button onClick={() => speakText(msg.content)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary-300 transition-colors">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072" />
                    </svg>
                    Speak
                  </button>
                  <CopyButton text={msg.content} />
                </div>
              )}
              {msg.role === 'assistant' && msg.content && <ExplainableAI message={msg} />}
            </div>

          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-accent-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
            </div>
            <div className="bg-surface-300 border border-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 pt-1 pb-0">
        <div className="flex gap-2 items-end bg-surface-300 border border-slate-700/50 rounded-2xl px-3 py-2 focus-within:border-primary-500/50 transition-colors">
          <textarea
            ref={inputRef}
            rows={1}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 resize-none outline-none max-h-32"
            placeholder={lang === 'kn' ? 'ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ...' : 'Ask about crimes, suspects, FIRs...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
          />
          <input ref={fileRef} type="file" accept=".pdf,.txt,.csv" className="hidden" onChange={handleFileUpload} />
          <button type="button"
            onMouseDown={() => startSTT(lang === 'kn' ? 'kn-IN' : 'en-IN')}
            onMouseUp={stopSTT}
            onTouchStart={() => startSTT(lang === 'kn' ? 'kn-IN' : 'en-IN')}
            onTouchEnd={stopSTT}
            title="Hold to speak"
            className={`p-2 rounded-xl transition-colors shrink-0 ${listening ? 'bg-accent text-white animate-pulse' : 'text-slate-500 hover:text-white hover:bg-surface-400'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
            className="p-2 rounded-xl bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0">
            {loading
              ? <Spinner size="sm" />
              : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            }
          </button>
        </div>
        <p className="text-xs text-slate-600 text-center mt-1">Hold mic to speak · Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
