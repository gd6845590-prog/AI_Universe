import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import logo from '../assets/logo.png'


const TOOLS = [
  { name: 'ElevenLabs', initial: 'E', color: '#f59e0b' },
  { name: 'Sora', initial: 'S', color: '#10a37f' },
  { name: 'Runway', initial: 'R', color: '#5b21b6' },
  { name: 'ChatGPT', initial: 'C', color: '#10a37f' },
  { name: 'Gemini', initial: 'G', color: '#4285f4' },
  { name: 'Copilot', initial: 'C', color: '#0078d4' },
  { name: 'Midjourney', initial: 'M', color: '#0d0d0d' },
  { name: 'Claude', initial: 'C', color: '#cc785c' },
  { name: 'Cursor', initial: 'C', color: '#8b5cf6' },
  { name: 'Perplexity', initial: 'P', color: '#20b2aa' },
]

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const videoRef = useRef(null)

  // ── Typewriter animation ──────────────────────────────────────────────────
  const PHRASES = [
    'discover the best AI tools.',
    'compare AI models side-by-side.',
    'integrate AI into your workflow.',
    'find the perfect API for your app.',
    'explore 50+ indexed AI tools.',
  ]
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [typing, setTyping] = useState(true)

  useEffect(() => {
    const phrase = PHRASES[phraseIdx]
    let timeout
    if (typing) {
      if (displayed.length < phrase.length) {
        timeout = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), 45)
      } else {
        timeout = setTimeout(() => setTyping(false), 1800) // pause before erasing
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 25)
      } else {
        setPhraseIdx((i) => (i + 1) % PHRASES.length)
        setTyping(true)
      }
    }
    return () => clearTimeout(timeout)
  }, [displayed, typing, phraseIdx])
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    let rafId = 0, timeoutId = 0, isFadingOut = false

    const animateOpacity = (from, to, duration, onDone) => {
      const startAt = performance.now()
      const step = (now) => {
        const progress = Math.min((now - startAt) / duration, 1)
        video.style.opacity = String(from + (to - from) * progress)
        if (progress < 1) { rafId = requestAnimationFrame(step); return }
        onDone?.()
      }
      rafId = requestAnimationFrame(step)
    }

    const startLoop = () => {
      video.play().then(() => animateOpacity(0, 1, 500)).catch(() => { })
    }

    const onTimeUpdate = () => {
      if (!video.duration || isFadingOut) return
      if (video.currentTime >= video.duration - 0.6) {
        isFadingOut = true
        animateOpacity(parseFloat(video.style.opacity) || 1, 0, 500, () => {
          video.pause(); video.currentTime = 0
          timeoutId = setTimeout(() => { isFadingOut = false; startLoop() }, 100)
        })
      }
    }

    video.style.opacity = '0'
    video.addEventListener('timeupdate', onTimeUpdate)
    startLoop()
    return () => { cancelAnimationFrame(rafId); clearTimeout(timeoutId); video.removeEventListener('timeupdate', onTimeUpdate) }
  }, [])

  return (
    <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'hsl(var(--background))', position: 'relative', overflow: 'hidden' }}>
      {/* Video BG */}
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4"
        muted playsInline preload="auto"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0, zIndex: 0 }}
      />

      {/* Center blur overlay */}
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 984, height: 527, background: 'hsl(260,87%,3%)', opacity: 0.88, filter: 'blur(82px)', borderRadius: '50%', zIndex: 1, pointerEvents: 'none' }} />

      {/* Navbar */}
      <header style={{ position: 'relative', zIndex: 10 }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px', width: '100%', gap: 16, boxSizing: 'border-box' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src={logo} alt="AI Universe" style={{ height: 32, width: 'auto' }} />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <Link to="/tools" className="hero-nav-link">Features</Link>
            <Link to="/compare" className="hero-nav-link">Solutions</Link>
            <Link to="/api-key-guide" className="hero-nav-link">Plans</Link>
            <Link to="/a-to-z" className="hero-nav-link">Learning</Link>
          </div>

          <Link to="/signup" className="heroSecondary liquid-glass" style={{ borderRadius: 9999, padding: '8px 20px', textDecoration: 'none', color: 'hsl(var(--foreground))', fontSize: 14, fontWeight: 600 }}>
            Sign Up
          </Link>
        </nav>
        <div style={{ height: 1, background: 'linear-gradient(to right, transparent, hsl(var(--foreground)/0.2), transparent)' }} />
      </header>

      {/* Hero Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', zIndex: 10, padding: '32px 20px' }}>
        <div>

          {/* ── Badge (reference image feature) ── */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 9999, marginBottom: 28,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            fontSize: 13, fontWeight: 500, color: 'rgba(245,240,230,0.75)',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'linear-gradient(135deg,#a855f7,#6366f1)', display: 'inline-block', flexShrink: 0 }} />
            50+ AI Tools Indexed
          </div>

          {/* ── Headline ── */}
          <h1
            className="hero-main-copy"
            style={{
              fontFamily: 'General Sans, sans-serif',
              fontSize: 'clamp(64px, 13vw, 220px)',
              letterSpacing: '-0.024em',
              lineHeight: 1.02,
              fontWeight: 700,
              color: 'hsl(var(--foreground))',
              margin: 0,
            }}
          >
            Power{' '}
            <span className="gradient-text">AI</span>
          </h1>

          {/* ── Subtext with typewriter ── */}
          <p style={{ color: 'hsl(var(--hero-sub))', fontSize: 18, lineHeight: 1.8, maxWidth: 520, margin: '16px auto 0', opacity: 0.82 }}>
            The most powerful AI ecosystem to{' '}
            <span style={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}>
              {displayed}
              <span style={{
                display: 'inline-block', width: 2, height: '1em',
                background: 'hsl(var(--foreground))',
                marginLeft: 2, verticalAlign: 'text-bottom',
                animation: 'blink 0.75s step-end infinite',
              }} />
            </span>
          </p>
          <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>

          {/* ── CTAs (two buttons like the reference) ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 28, flexWrap: 'wrap' }}>
            <button
              onClick={() => user ? navigate('/tools') : navigate('/login', { state: { from: '/tools' } })}
              className="heroSecondary liquid-glass"
              style={{ borderRadius: 9999, padding: '16px 32px', color: 'hsl(var(--foreground))', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', background: 'none' }}
            >
              Explore AI Universe
            </button>
            <Link
              to="/chat"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: 'rgba(245,240,230,0.65)', fontWeight: 500, fontSize: 15, transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(245,240,230,1)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(245,240,230,0.65)'}
            >
              Chat with AI Assistant <span style={{ fontSize: 13, opacity: 0.7 }}>›</span>
            </Link>
          </div>

          {/* ── Stats row ── per-character color + subtle shimmer ── */}
          <style>{`
            @keyframes shimmer-gold {
              0%   { background-position: -200% center; }
              60%  { background-position: 200% center; }
              100% { background-position: 200% center; }
            }
            @keyframes shimmer-purple {
              0%   { background-position: -200% center; }
              60%  { background-position: 200% center; }
              100% { background-position: 200% center; }
            }
            .stat-gold {
              background: linear-gradient(90deg, #fbbf24 35%, #fef3c7 50%, #fbbf24 65%);
              background-size: 300% auto;
              -webkit-background-clip: text; -webkit-text-fill-color: transparent;
              background-clip: text;
              animation: shimmer-gold 3.5s ease-in-out infinite;
            }
            .stat-purple {
              background: linear-gradient(90deg, #a855f7 35%, #e0c3fc 50%, #a855f7 65%);
              background-size: 300% auto;
              -webkit-background-clip: text; -webkit-text-fill-color: transparent;
              background-clip: text;
              animation: shimmer-purple 3.5s ease-in-out infinite 0.4s;
            }
          `}</style>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, marginTop: 40, flexWrap: 'wrap' }}>
            {/* 50+  — 5=gold shimmer, 0+=purple shimmer */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'General Sans, sans-serif', fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1 }}>
                <span className="stat-gold">5</span><span className="stat-purple">0+</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(245,240,230,0.5)', marginTop: 4 }}>AI Tools</div>
            </div>
            {/* 7 — purple shimmer */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'General Sans, sans-serif', fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1 }}>
                <span className="stat-purple">7</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(245,240,230,0.5)', marginTop: 4 }}>Categories</div>
            </div>
            {/* Free — F=gold shimmer, ree=purple shimmer */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'General Sans, sans-serif', fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1 }}>
                <span className="stat-gold">F</span><span className="stat-purple">ree</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(245,240,230,0.5)', marginTop: 4 }}>to Explore</div>
            </div>
          </div>


        </div>
      </div>

      {/* ── Marquee row ── */}
      <div style={{ position: 'relative', zIndex: 10, paddingBottom: 36, paddingInline: 24 }}>
        <div style={{ maxWidth: 1100, marginInline: 'auto', display: 'flex', alignItems: 'center', gap: 40 }}>
          <p style={{ color: 'rgba(245,240,230,0.4)', fontSize: 13, whiteSpace: 'nowrap', flexShrink: 0 }}>
            Relied on by AI tools across the globe
          </p>
          <div className="marquee-wrapper" style={{ flex: 1, overflow: 'hidden' }}>
            <div className="animate-marquee" style={{ display: 'flex', alignItems: 'center', gap: 0, width: 'max-content' }}>
              {[...TOOLS, ...TOOLS].map((tool, i) => (
                <div key={`${tool.name}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
                  {/* Separator */}
                  <span style={{ color: 'rgba(245,240,230,0.2)', fontSize: 14, padding: '0 16px' }}>|</span>
                  {/* Avatar */}
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: tool.color || 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, color: '#fff',
                    border: '1.5px solid rgba(255,255,255,0.15)',
                    marginRight: 8, flexShrink: 0,
                  }}>
                    {tool.initial}
                  </div>
                  {/* Name */}
                  <span style={{ color: 'rgba(245,240,230,0.85)', fontSize: 15, fontWeight: 600 }}>{tool.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
