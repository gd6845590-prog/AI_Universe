import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Link } from 'react-router-dom'
import { AI_TOOLS } from '../utils/constants'
import { Star, ExternalLink, ArrowRight } from 'lucide-react'

const WEB_TOOLS = AI_TOOLS.filter(t => t.category === 'web')

export default function WebsiteMaker() {
  return (
    <div style={{ minHeight: '100vh', background: 'hsl(260,87%,3%)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(236,72,153,0.08) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '100px 32px 48px', textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 9999,
          background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.25)',
          marginBottom: 20, fontSize: 13, color: '#f472b6', fontWeight: 500,
        }}>
          🌐 Website Maker AI Tools
        </div>
        <h1 style={{
          fontFamily: 'General Sans, sans-serif',
          fontSize: 'clamp(28px,5vw,54px)', fontWeight: 700,
          letterSpacing: '-0.03em', color: 'hsl(40,6%,95%)',
          marginBottom: 16, lineHeight: 1.1,
        }}>
          Build Apps with AI,<br />
          <span style={{
            background: 'linear-gradient(135deg, #ec4899, #a855f7)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>No Code Required</span>
        </h1>
        <p style={{
          color: 'rgba(245,240,230,0.55)', fontSize: 17, maxWidth: 520,
          margin: '0 auto', lineHeight: 1.6,
        }}>
          Compare the best AI-powered website and app builders. From landing pages to full-stack SaaS — pick the right tool.
        </p>
      </div>

      {/* Tools Grid */}
      <div style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
          {WEB_TOOLS.map(tool => (
            <div key={tool.id} className="glass-card" style={{
              borderRadius: 20, padding: 28,
              border: '1px solid rgba(236,72,153,0.12)',
              transition: 'all 0.25s ease', position: 'relative', overflow: 'hidden',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(236,72,153,0.12)'
                e.currentTarget.style.borderColor = 'rgba(236,72,153,0.25)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)'
                e.currentTarget.style.borderColor = 'rgba(236,72,153,0.12)'
              }}
            >
              {/* Decorative element */}
              <div style={{
                position: 'absolute', top: -20, right: -20,
                width: 80, height: 80, borderRadius: '50%',
                background: `radial-gradient(circle, ${tool.color}20, transparent 70%)`,
                pointerEvents: 'none',
              }} />

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, fontSize: 26,
                    background: `${tool.color}18`, border: `1px solid ${tool.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {tool.emoji}
                  </div>
                  <div>
                    <div style={{
                      fontFamily: 'General Sans, sans-serif',
                      fontWeight: 700, fontSize: 18, color: 'hsl(40,6%,95%)',
                      letterSpacing: '-0.01em',
                    }}>
                      {tool.name}
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(245,240,230,0.4)' }}>{tool.company}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={14} fill="#fbbf24" color="#fbbf24" />
                  <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: 14 }}>{tool.rating}</span>
                </div>
              </div>

              <p style={{ color: 'rgba(245,240,230,0.6)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
                {tool.description}
              </p>

              {/* Pricing Table */}
              <div style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.06)',
                overflow: 'hidden', marginBottom: 18,
              }}>
                {[
                  { label: 'Free', value: tool.pricing?.free, color: '#10b981' },
                  { label: 'Pro', value: tool.pricing?.pro, color: '#a855f7' },
                ].map((p, i) => (
                  <div key={p.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px',
                    borderBottom: i === 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(245,240,230,0.5)' }}>{p.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: p.color }}>{p.value || 'N/A'}</span>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {tool.features?.slice(0, 3).map(f => (
                  <span key={f} style={{
                    fontSize: 11, padding: '3px 10px', borderRadius: 999, fontWeight: 500,
                    background: 'rgba(255,255,255,0.05)', color: 'rgba(245,240,230,0.6)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    {f}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10 }}>
                <Link to={`/tools/${tool.slug}`} style={{
                  flex: 1, textAlign: 'center', padding: '10px',
                  borderRadius: 10, textDecoration: 'none',
                  background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.2)',
                  color: '#f472b6', fontSize: 13, fontWeight: 600,
                }}>
                  View Details
                </Link>
                <a href={tool.website} target="_blank" rel="noreferrer" style={{
                  padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(245,240,230,0.6)', display: 'flex', alignItems: 'center',
                }}>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ marginTop: 60, textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'General Sans, sans-serif', color: 'hsl(40,6%,95%)', fontWeight: 700,
            fontSize: 28, marginBottom: 12, letterSpacing: '-0.02em',
          }}>
            Not sure which to pick?
          </h2>
          <p style={{ color: 'rgba(245,240,230,0.5)', fontSize: 15, marginBottom: 24 }}>
            Our AI Advisor will recommend the best website builder based on your project and budget.
          </p>
          <Link to="/chat" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 28px', borderRadius: 9999,
            background: 'linear-gradient(135deg, #ec4899, #a855f7)',
            color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 15,
          }}>
            Ask AI Advisor <ArrowRight size={16} />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
