import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, Zap, ChevronDown, LogOut, User, LayoutDashboard, MessageSquare } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const NAV_LINKS = [
  { label: 'Tools',    path: '/tools' },
  { label: 'Compare',  path: '/compare' },
  { label: 'Categories', path: '/categories' },
  { label: 'A–Z',     path: '/a-to-z' },
  { label: 'API Keys', path: '/api-key-guide' },
]

export default function Navbar({ transparent = false }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userDropdown, setUserDropdown] = useState(false)
  const dropdownRef = useRef(null)
  
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try { await logout() } catch (e) {}
    navigate('/')
  }

  const isHome = location.pathname === '/'

  return (
    <nav
      style={{
        position: transparent ? 'absolute' : 'fixed',
        top: 0, left: 0, right: 0, zIndex: 100,
        background: transparent ? 'transparent' : 'rgba(10, 5, 25, 0.88)',
        backdropFilter: transparent ? 'none' : 'blur(22px)',
        borderBottom: transparent ? 'none' : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 32px',
          width: '100%',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)',
          }}>
            <Zap size={20} color="#fff" />
          </div>
          <span style={{
            fontFamily: 'General Sans, sans-serif',
            fontWeight: 700,
            fontSize: '18px',
            color: 'hsl(40, 6%, 95%)',
            letterSpacing: '-0.02em',
          }}>
            AI Universe
          </span>
        </Link>

        {/* Center Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.label}
              to={link.path}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                color: 'rgba(245, 240, 230, 0.9)',
                textDecoration: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(245,240,230,0.9)'; e.currentTarget.style.background = 'transparent' }}
            >
              {link.label}
              {link.hasDropdown && <ChevronDown size={14} />}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button 
                onClick={() => setUserDropdown(!userDropdown)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '6px 14px 6px 6px', borderRadius: '30px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(245,240,230,0.9)', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 500,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 13 }}>
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                {user.name || 'Dashboard'}
              </button>

              {userDropdown && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 200, background: '#110b1a',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 14, overflow: 'hidden',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
                  zIndex: 200,
                  display: 'flex', flexDirection: 'column'
                }}>
                  <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Link to="/dashboard" onClick={() => setUserDropdown(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', textDecoration: 'none', color: 'hsl(40,6%,95%)', fontSize: 14, borderRadius: 8, transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <LayoutDashboard size={16} color="rgba(245,240,230,0.7)" /> Dashboard
                    </Link>
                    <Link to="/chat" onClick={() => setUserDropdown(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', textDecoration: 'none', color: 'hsl(40,6%,95%)', fontSize: 14, borderRadius: 8, transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <MessageSquare size={16} color="rgba(245,240,230,0.7)" /> Chat with AI
                    </Link>
                  </div>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
                  <div style={{ padding: 8 }}>
                    <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', width: '100%', textDecoration: 'none', color: '#f87171', fontSize: 14, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" style={{
                color: 'rgba(245,240,230,0.8)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                padding: '8px 16px',
              }}>
                Log in
              </Link>
              <Link to="/signup" className="heroSecondary liquid-glass" style={{
                borderRadius: '9999px',
                padding: '8px 20px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
              }}>
                Sign Up
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ color: 'rgba(245,240,230,0.9)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Divider */}
      {!transparent && (
        <div style={{
          height: 1,
          marginTop: 3,
          background: 'linear-gradient(to right, transparent, rgba(245,240,230,0.2), transparent)',
        }} />
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          background: 'rgba(10, 5, 25, 0.97)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '16px',
        }}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.label}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'block', padding: '12px 16px',
                color: 'rgba(245,240,230,0.9)', textDecoration: 'none',
                borderRadius: '8px', marginBottom: '4px', fontSize: '15px',
              }}
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <Link to="/login" onClick={() => setMobileOpen(false)}
                style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.06)', color: '#fff', textDecoration: 'none' }}>
                Log in
              </Link>
              <Link to="/signup" onClick={() => setMobileOpen(false)}
                style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff', textDecoration: 'none' }}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
