import { useState } from 'react'
import { supabase } from '../data/backend'
import { useStore } from '../data/store'
import HeroArt from '../components/HeroArt'

// Email code (not magic link): links open in Safari, but a home-screen app keeps its own login.
export default function Login() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const run = async (e, fn) => {
    e.preventDefault(); setBusy(true); setErr('')
    const { error } = await fn().catch((x) => ({ error: x }))
    setBusy(false)
    if (error) setErr(error.message || 'Something went wrong — check your connection.')
    return !error
  }
  const send = (e) => run(e, () => supabase.auth.signInWithOtp({ email: email.trim().toLowerCase() })).then((ok) => ok && setStep('code'))
  const verify = (e) => run(e, () => supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.trim(), type: 'email' }))

  return (
    <div className="page login">
      <div className="logo"><span className="ps">PS.</span> <span className="eu">Europe</span></div>
      <section className="hero"><HeroArt /></section>
      <div className="card">
        {step === 'email' ? (
          <form className="form" onSubmit={send}>
            <h2>Hello, traveller 👋</h2>
            <p className="muted">Sign in with your email — we’ll send you a login code.</p>
            <input type="email" required autoComplete="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn primary" disabled={busy}>{busy ? 'Sending…' : 'Send me a code'}</button>
          </form>
        ) : (
          <form className="form" onSubmit={verify}>
            <h2>Check your inbox 💌</h2>
            <p className="muted">Enter the code we sent to <b>{email}</b>.</p>
            <input inputMode="numeric" autoComplete="one-time-code" required maxLength={10} placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} />
            <button className="btn primary" disabled={busy}>{busy ? 'Checking…' : 'Sign in'}</button>
            <button type="button" className="btn ghost" onClick={() => { setStep('email'); setCode('') }}>Use a different email</button>
          </form>
        )}
        {err && <p className="error small">{err}</p>}
      </div>
    </div>
  )
}

export function NotMember() {
  const { email, signOut } = useStore()
  return (
    <div className="page login">
      <div className="logo"><span className="ps">PS.</span> <span className="eu">Europe</span></div>
      <div className="card center">
        <div className="empty-emoji">🧳</div>
        <h2>Not on the crew list yet</h2>
        <p className="muted"><b>{email}</b> hasn’t been invited to this trip. Ask a crew member to invite this email from the Crew page.</p>
        <button className="btn ghost wide" onClick={signOut}>Sign out</button>
      </div>
    </div>
  )
}
