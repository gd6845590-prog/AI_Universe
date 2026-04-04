/**
 * ─── Source Code Protection ──────────────────────────────────────────────
 * Blocks casual inspection of client-side code via:
 *  • Right-click context menu
 *  • DevTools shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U)
 *  • Text selection & drag
 *  • Console warning message
 *
 * NOTE: Only enabled in production. Dev mode is unrestricted.
 * ────────────────────────────────────────────────────────────────────────── */

export function initSourceProtection() {
  // Skip in development so you can still debug
  if (import.meta.env.DEV) return

  // ── 1. Disable right-click context menu ──
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    return false
  })

  // ── 2. Block DevTools keyboard shortcuts ──
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault()
      return false
    }

    // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Element picker)
    if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
      e.preventDefault()
      return false
    }

    // Ctrl+U (View Source)
    if (e.ctrlKey && e.key.toUpperCase() === 'U') {
      e.preventDefault()
      return false
    }

    // Ctrl+S (Save page)
    if (e.ctrlKey && e.key.toUpperCase() === 'S') {
      e.preventDefault()
      return false
    }

    // Ctrl+A (Select all)
    if (e.ctrlKey && e.key.toUpperCase() === 'A') {
      e.preventDefault()
      return false
    }
  })

  // ── 3. Disable text selection ──
  document.addEventListener('selectstart', (e) => {
    // Allow selection inside input/textarea for usability
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
    e.preventDefault()
  })

  // ── 4. Disable drag ──
  document.addEventListener('dragstart', (e) => {
    e.preventDefault()
  })

  // ── 5. Disable copy (except in inputs) ──
  document.addEventListener('copy', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
    e.preventDefault()
  })

  // ── 6. Console warning ──
  const warningStyle = 'color:#ff4444; font-size:20px; font-weight:bold;'
  const infoStyle = 'color:#ffaa00; font-size:14px;'

  console.log('%c⛔ STOP!', warningStyle)
  console.log(
    '%cThis is a protected application. Unauthorized access or code inspection is not permitted.',
    infoStyle
  )
  console.log(
    '%cIf someone told you to paste something here, it is a scam. Close this window immediately.',
    infoStyle
  )

  // ── 7. Detect DevTools open (debugger trap) ──
  ;(function detectDevTools() {
    const threshold = 160
    const check = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold
      const heightThreshold = window.outerHeight - window.innerHeight > threshold
      if (widthThreshold || heightThreshold) {
        document.body.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:center;height:100vh;
            background:#0a0515;flex-direction:column;gap:16px;font-family:system-ui,sans-serif;">
            <div style="font-size:48px;">🛡️</div>
            <h1 style="color:#ff4444;font-size:24px;margin:0;">Access Denied</h1>
            <p style="color:#888;font-size:14px;margin:0;">Developer tools are not allowed on this site.</p>
            <p style="color:#666;font-size:13px;margin:0;">Please close DevTools and refresh the page.</p>
          </div>
        `
      }
    }
    setInterval(check, 1000)
  })()
}
