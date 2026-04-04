import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/layout/Navbar'
import { Send, Bot, User, Loader, Sparkles, Plus, MessageSquare, History } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

const STARTER_PROMPTS = [
  'I want a text-to-speech API for my app, budget $100/month',
  'Best free AI chatbot for customer support with API access',
  'Compare ChatGPT vs Claude for content writing',
  'How do I get an OpenAI API key?',
  'What is the best AI for video generation under $50/month?',
]

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:4px;font-size:0.9em">$1</code>')
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre style="background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px;overflow-x:auto;margin:8px 0"><code>$1</code></pre>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:1.1em;font-weight:600;margin:12px 0 6px">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 style="font-size:1.2em;font-weight:700;margin:12px 0 6px">$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 style="font-size:1.3em;font-weight:700;margin:12px 0 6px">$1</h1>')
    .replace(/^\- (.+)$/gm, '<li style="margin:4px 0;padding-left:4px">$1</li>')
    .replace(/(<li.*<\/li>)/gs, '<ul style="padding-left:20px;margin:8px 0">$1</ul>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

export default function ChatWithAI() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [sessions, setSessions] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const endRef = useRef(null)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    api.get('/chat/sessions').then((r) => setSessions(r.data)).catch(() => {})
  }, [])

  const sendMessage = async (text = input) => {
    const msg = (text || '').trim()
    if (!msg || loading) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const { data } = await api.post('/chat', { message: msg, session_id: sessionId })
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }])
      if (!sessionId) {
        setSessionId(data.session_id)
        // refresh sessions list
        api.get('/chat/sessions').then((r) => setSessions(r.data)).catch(() => {})
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I couldn't process that. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  const newChat = () => {
    setMessages([])
    setSessionId(null)
    setInput('')
  }

  const loadSession = async (sid) => {
    try {
      const { data } = await api.get(`/chat/history/${sid}`)
      setMessages(data)
      setSessionId(sid)
      setShowHistory(false)
    } catch (e) {}
  }

  return (
    <div style={{ minHeight:'100vh', background:'hsl(260,87%,3%)', display:'flex', flexDirection:'column' }}>
      <Navbar />

      <div style={{ flex:1, display:'flex', overflow:'hidden', height:'calc(100vh - 64px)', marginTop:64, position:'relative' }}>
        {/* Sidebar */}
        <div style={{
          position: isMobile ? 'absolute' : 'relative',
          zIndex: isMobile ? 50 : 1,
          height: '100%',
          width: showHistory ? (isMobile ? '100%' : 260) : 0,
          transition:'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow:'hidden',
          flexShrink:0,
          borderRight:'1px solid rgba(255,255,255,0.06)',
          background:'hsl(260,87%,5%)',
          display:'flex',
          flexDirection:'column',
        }}>
          <div style={{ padding:16, borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', gap:8 }}>
            <button onClick={newChat} style={{
              flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              padding:'10px 14px', borderRadius:10, border:'1px solid rgba(124,58,237,0.35)',
              background:'rgba(124,58,237,0.15)', color:'#c4b5fd',
              cursor:'pointer', fontSize:13, fontWeight:500,
            }}>
              <Plus size={14} /> New Chat
            </button>
            {isMobile && (
              <button onClick={() => setShowHistory(false)} style={{
                width:40, display:'flex', alignItems:'center', justifyContent:'center',
                borderRadius:10, border:'1px solid rgba(255,255,255,0.1)',
                background:'rgba(255,255,255,0.05)', color:'rgba(245,240,230,0.7)',
                cursor:'pointer'
              }}>
                <Plus size={16} style={{ transform:'rotate(45deg)' }} />
              </button>
            )}
          </div>
          <div style={{ flex:1, overflowY:'auto', padding:'8px 8px' }}>
            {sessions.map((s) => (
              <button key={s.session_id} onClick={() => loadSession(s.session_id)} style={{
                width:'100%', textAlign:'left', padding:'8px 12px', borderRadius:8, border:'none',
                background: sessionId === s.session_id ? 'rgba(124,58,237,0.15)' : 'transparent',
                color:'rgba(245,240,230,0.6)', cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', gap:8,
              }}>
                <MessageSquare size={12} style={{ shrink:0, opacity:0.5 }} />
                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.last_message}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', opacity: isMobile && showHistory ? 0.3 : 1, transition:'opacity 0.3s' }}>
          {/* Header */}
          <div style={{ padding: isMobile ? '12px 16px' : '12px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={() => setShowHistory(!showHistory)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(245,240,230,0.5)', display:'flex' }}>
              <History size={18} />
            </button>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Bot size={18} color="#fff" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight:600, color:'hsl(40,6%,95%)', fontSize:14, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>AI Universe Assistant</div>
              <div style={{ fontSize:12, color:'rgba(245,240,230,0.4)' }}>Powered by AI</div>
            </div>
            {!isMobile && (
              <button onClick={newChat} style={{
                marginLeft:'auto', display:'flex', alignItems:'center', gap:6,
                padding:'6px 14px', borderRadius:20, border:'1px solid rgba(255,255,255,0.1)',
                background:'transparent', color:'rgba(245,240,230,0.6)', cursor:'pointer', fontSize:12,
              }}>
                <Plus size={12} /> New chat
              </button>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding: isMobile ? '16px 12px' : '24px 20px', display:'flex', flexDirection:'column', gap: isMobile ? 16 : 20 }}>
            {messages.length === 0 && (
              <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding: isMobile ? '20px 10px' : '40px 20px' }}>
                <div style={{ width: isMobile ? 56 : 64, height: isMobile ? 56 : 64, borderRadius:20, background:'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(79,70,229,0.2))', border:'1px solid rgba(124,58,237,0.2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                  <Sparkles size={30} color="#a78bfa" />
                </div>
                <h2 style={{ fontFamily:'General Sans,sans-serif', fontSize:22, fontWeight:700, color:'hsl(40,6%,95%)', marginBottom:10 }}>AI Universe Assistant</h2>
                <p style={{ color:'rgba(245,240,230,0.5)', fontSize:14, maxWidth:380, marginBottom:32 }}>
                  Ask me anything about AI tools, API keys, pricing, or get personalized recommendations.
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:8, width:'100%', maxWidth:500 }}>
                  {STARTER_PROMPTS.map((p, i) => (
                    <button key={i} onClick={() => sendMessage(p)} style={{
                      textAlign:'left', padding:'12px 16px', borderRadius:12,
                      background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)',
                      color:'rgba(245,240,230,0.7)', cursor:'pointer', fontSize:13, transition:'all 0.2s',
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.background='rgba(124,58,237,0.12)'; e.currentTarget.style.borderColor='rgba(124,58,237,0.3)'; e.currentTarget.style.color='#c4b5fd' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.color='rgba(245,240,230,0.7)' }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{ display:'flex', gap: isMobile ? 8 : 12, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems:'flex-start' }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                    <Sparkles size={12} color="#fff" />
                  </div>
                )}
                <div style={{ maxWidth: isMobile ? '90%' : '80%' }}>
                  <div className={msg.role === 'assistant' ? 'glass-card' : ''} style={{
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                    padding:'13px 17px',
                    background: msg.role === 'user' ? 'linear-gradient(135deg,rgba(124,58,237,0.5),rgba(79,70,229,0.5))' : 'rgba(255,255,255,0.04)',
                    border: msg.role === 'user' ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    color:'hsl(40,6%,95%)',
                    fontSize:14, lineHeight:1.7,
                  }}>
                    {msg.role === 'assistant'
                      ? <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                      : msg.content
                    }
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <User size={15} color="rgba(245,240,230,0.7)" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Sparkles size={14} color="#fff" />
                </div>
                <div className="glass-card" style={{ borderRadius:'4px 18px 18px 18px', padding:'14px 20px', display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ display:'flex', gap:4 }}>
                    {[0,1,2].map((i) => (
                      <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:'#a855f7', animation:`bounce 0.8s ${i*0.15}s ease-in-out infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ padding: isMobile ? '10px 12px' : '12px 20px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <div className="glass-card" style={{ borderRadius:14, padding:'8px 8px 8px 16px', display:'flex', alignItems:'center', gap:10, border:'1px solid rgba(124,58,237,0.2)' }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Ask about any AI tool, API key, or pricing..."
                rows={1}
                style={{
                  flex:1, background:'none', border:'none', outline:'none',
                  color:'hsl(40,6%,95%)', fontSize:14, fontFamily:'inherit',
                  resize:'none', lineHeight:1.5, maxHeight:120, overflowY:'auto',
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                style={{
                  width:40, height:40, borderRadius:10, border:'none',
                  background: input.trim() && !loading ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,0.06)',
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'all 0.2s', flexShrink:0,
                }}
              >
                <Send size={16} color={input.trim() && !loading ? '#fff' : 'rgba(245,240,230,0.2)'} />
              </button>
            </div>
            <p style={{ textAlign:'center', fontSize:11, color:'rgba(245,240,230,0.3)', marginTop:8 }}>
              AI may make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
