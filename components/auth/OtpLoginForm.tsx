'use client'

import { FormEvent, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { safeReturnPath } from '@/lib/auth/safeReturnPath'

export function OtpLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = safeReturnPath(searchParams.get('next'))
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function requestOtp(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
    })

    setLoading(false)
    if (error) {
      setMessage(error.message)
      return
    }

    setSent(true)
    setMessage('Check your inbox for the one-time code or secure sign-in link.')
  }

  async function verifyOtp(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })

    setLoading(false)
    if (error) {
      setMessage(error.message)
      return
    }

    router.replace(next)
    router.refresh()
  }

  return (
    <div className="win95-desktop auth-desktop">
      <section className="win95-window auth-window" aria-labelledby="login-title">
        <div className="win95-titlebar">
          <div className="win95-titlebar-label"><span className="win95-app-icon">K</span><span>KUER Studio Log On</span></div>
        </div>
        <div className="win95-menubar"><span><u>F</u>ile</span><span><u>H</u>elp</span></div>
        <div className="auth-content">
          <div className="auth-key" aria-hidden="true">OTP</div>
          <div>
            <h1 id="login-title">Log on to KUER Studio</h1>
            <p>Enter your email address. We will send a secure one-time password and sign-in link.</p>
          </div>

          <form onSubmit={sent ? verifyOtp : requestOtp} className="auth-form">
            <label htmlFor="email">Email address:</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              disabled={sent || loading}
            />

            {sent && (
              <>
                <label htmlFor="otp">One-time password:</label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  minLength={6}
                  maxLength={8}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                />
              </>
            )}

            {message && <p className="auth-message" role="status">{message}</p>}

            <div className="auth-actions">
              {sent && (
                <button type="button" onClick={() => { setSent(false); setOtp(''); setMessage('') }} disabled={loading}>
                  Back
                </button>
              )}
              <button type="submit" disabled={loading || (sent && otp.length < 6)}>
                {loading ? 'Please wait...' : sent ? 'Verify code' : 'Send code'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
