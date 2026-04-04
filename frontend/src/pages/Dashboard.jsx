import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/context/AuthContext'
import { useTools } from '@/context/ToolContext'
import api from '@/lib/api'
import { MessageSquare, TrendingUp, Bookmark, Star, Loader2 } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const { tools, loading: toolsLoading } = useTools()
  const [savedTools, setSavedTools] = useState([])
  const [savedLoading, setSavedLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setSavedLoading(true)
      api.get('/user/saved-tools')
        .then((r) => setSavedTools(r.data))
        .catch(() => {})
        .finally(() => setSavedLoading(false))
    }
  }, [user])

  const topTools = tools.filter((t) => t.popularity >= 80).slice(0, 4)

  const ToolCard = ({ tool, isSaved }) => (
    <Link to={`/tools/${tool.slug}`} style={{ textDecoration:'none' }}>
      <div className="glass-card" style={{ borderRadius:14, padding:20, transition:'all 0.2s' }}
        onMouseEnter={(e) => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.transform='translateY(-2px)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.transform='translateY(0)' }}
      >
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
          <div style={{ width:40, height:40, borderRadius:10, background: tool.icon_color || '#6366f1', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:16, flexShrink:0 }}>
            {tool.icon || tool.name?.[0]}
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ fontWeight:600, color:'hsl(40,6%,95%)', fontSize:15, whiteSpace:'nowrap', textOverflow:'ellipsis', overflow:'hidden' }}>{tool.name}</div>
            <div style={{ fontSize:12, color:'rgba(245,240,230,0.4)', whiteSpace:'nowrap', textOverflow:'ellipsis', overflow:'hidden' }}>{tool.provider}</div>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
            {isSaved ? (
              <Bookmark size={14} fill="#fbbf24" color="#fbbf24" />
            ) : (
              <>
                <Star size={12} fill="#fbbf24" color="#fbbf24" />
                <span style={{ fontSize:12, color:'#fbbf24', fontWeight:600 }}>{tool.rating}</span>
              </>
            )}
          </div>
        </div>
        <p style={{ fontSize:13, color:'rgba(245,240,230,0.5)', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {tool.description}
        </p>
      </div>
    </Link>
  )

  return (
    <div style={{ minHeight:'100vh', background:'hsl(260,87%,3%)', display:'flex', flexDirection:'column' }}>
      <Navbar transparent={false} />

      <div style={{ flex:1, maxWidth:1200, margin:'0 auto', width:'100%', padding:'100px 24px 64px' }}>
        
        {/* Welcome Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', flexShrink:0 }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 style={{ fontFamily: 'General Sans,sans-serif', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: 'hsl(40,6%,95%)', marginBottom: 6 }}>
              Welcome back, {user?.name || 'Explorer'}!
            </h1>
            <p style={{ color: 'rgba(245,240,230,0.5)', fontSize: 15 }}>
              {user?.email || 'explorer@aiuniverse.com'}
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 56 }}>
          
          <Link to="/chat" className="glass-card" style={{ textDecoration: 'none', padding: '24px 20px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor='rgba(124,58,237,0.3)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink:0 }}>
              <MessageSquare size={20} color="#a855f7" />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'hsl(40,6%,95%)', fontSize: 16, marginBottom: 4 }}>Chat with AI</div>
              <div style={{ fontSize: 13, color: 'rgba(245,240,230,0.5)' }}>Get recommendations</div>
            </div>
          </Link>

          <Link to="/tools" className="glass-card" style={{ textDecoration: 'none', padding: '24px 20px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor='rgba(59,130,246,0.3)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink:0 }}>
              <TrendingUp size={20} color="#60a5fa" />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'hsl(40,6%,95%)', fontSize: 16, marginBottom: 4 }}>Explore Tools</div>
              <div style={{ fontSize: 13, color: 'rgba(245,240,230,0.5)' }}>Browse {tools.length || '50+'} AI tools</div>
            </div>
          </Link>

          <div className="glass-card" style={{ padding: '24px 20px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink:0 }}>
              <Bookmark size={20} color="#fbbf24" />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'hsl(40,6%,95%)', fontSize: 16, marginBottom: 4 }}>Saved Tools</div>
              <div style={{ fontSize: 13, color: 'rgba(245,240,230,0.5)' }}>{savedTools.length} saved</div>
            </div>
          </div>

        </div>

        {/* Saved Tools Section */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'General Sans,sans-serif', fontSize: 22, fontWeight: 700, color: 'hsl(40,6%,95%)' }}>Saved Tools</h2>
            <Link to="/tools" style={{ color: '#a855f7', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#c4b5fd'} onMouseLeave={(e) => e.target.style.color = '#a855f7'}>Browse more</Link>
          </div>
          
          {savedLoading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'40px 0' }}>
              <Loader2 size={28} color="#a855f7" style={{ animation:'spin 1s linear infinite' }} />
            </div>
          ) : savedTools.length === 0 ? (
            <div className="glass-card" style={{ borderRadius: 16, padding: '60px 20px', textAlign: 'center', display:'flex', flexDirection:'column', alignItems:'center', border: '1px solid rgba(255,255,255,0.04)' }}>
              <Bookmark size={36} color="rgba(245,240,230,0.2)" strokeWidth={1.5} style={{ marginBottom: 16 }} />
              <div style={{ color: 'rgba(245,240,230,0.6)', fontSize: 16, marginBottom: 12, fontWeight: 500 }}>No saved tools yet</div>
              <Link to="/tools" style={{ color: '#a855f7', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#c4b5fd'} onMouseLeave={(e) => e.target.style.color = '#a855f7'}>Browse AI tools</Link>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
              {savedTools.map(tool => <ToolCard key={tool.slug} tool={tool} isSaved={true} />)}
            </div>
          )}
        </div>

        {/* Trending AI Tools Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'General Sans,sans-serif', fontSize: 22, fontWeight: 700, color: 'hsl(40,6%,95%)' }}>Trending AI Tools</h2>
            <Link to="/tools" style={{ color: '#a855f7', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#c4b5fd'} onMouseLeave={(e) => e.target.style.color = '#a855f7'}>See all</Link>
          </div>
          
          {toolsLoading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'40px 0' }}>
              <Loader2 size={28} color="#a855f7" style={{ animation:'spin 1s linear infinite' }} />
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
              {topTools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} isSaved={false} />
              ))}
            </div>
          )}
        </div>

      </div>
      <Footer />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
