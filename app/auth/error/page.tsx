import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function AuthErrorPage() {
  return (
    <div className="win95-desktop auth-desktop">
      <section className="win95-window auth-window">
        <div className="win95-titlebar"><div className="win95-titlebar-label">KUER Studio</div></div>
        <div className="auth-content auth-error">
          <h1>Logon failed</h1>
          <p>The code or link is invalid or expired. Request a fresh one-time password.</p>
          <Link href="/login" className="win95-button-link">Try again</Link>
        </div>
      </section>
    </div>
  )
}
