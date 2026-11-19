import { useState } from 'react'
import { supabase, linkError } from '../data/backend'
import { useStore } from '../data/store'
import HeroArt from '../components/HeroArt'

const HERE = location.origin + location.pathname
const TEXT = {
  signin: ['Hello, traveller 👋', 'Sign in to your shared trip.', 'Sign in'],
  signup: ['Join the crew ✨', 'First time? Create your account with the email you were invited with.', 'Create account'],
  forgot: ['Forgot your password? 🔑', 'Enter your email and we’ll send you a link to set a new one.', 'Send reset link'],
}

// Email + password: the free Supabase mailer can't send codes, and email links open in Safari,
// not the home-screen app. So email is only used to confirm the account and to reset a password.
export default function Login() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState(linkError ? `That email link didn’t work (${linkError}). Links expire after a while — request a new one.` : '')
  const [busy, setBusy] = useState(false)
  const go = (m) => { setMode(m); setErr(''); setMsg('') }

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr(''); setMsg('')
    const creds = { email: email.trim().toLowerCase(), password }
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword(creds)
        if (error) throw error
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(creds.email, { redirectTo: HERE })
        if (error) throw error
        setMsg('Check your inbox (and spam folder) for the reset link. Open it, choose a new password, then come back here and sign in.')
        setMode('signin')
      } else {
        const { data, error } = await supabase.auth.signUp({ ...creds, options: { emailRedirectTo: HERE } })
        if (error) throw error
        if (data.user?.identities?.length === 0) throw new Error('This email already has an account — sign in instead.')
        setMsg('Almost there! Open the confirmation email and tap the link, then come back here and sign in.')
        setMode('signin')
      }
    } catch (x) {
      setErr(x.message === 'Email not confirmed' ? 'Please tap the link in your confirmation email first.' : x.message || 'Something went wrong — check your connection.')
    }
    setBusy(false)
  }

  return (
    <div className="page login">
      <div className="logo"><span className="ps">PS.</span> <span className="eu">Europe</span></div>
      <section className="hero"><HeroArt /></section>
      <div className="card">
        <form className="form" onSubmit={submit}>
          <h2>{TEXT[mode][0]}</h2>
          <p className="muted">{TEXT[mode][1]}</p>
          <input type="email" required autoComplete="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          {mode !== 'forgot' && <input type="password" required minLength={6} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} placeholder="Password (6+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} />}
          <button className="btn primary" disabled={busy}>{busy ? '…' : TEXT[mode][2]}</button>
          {mode === 'signin' && <button type="button" className="link small center" onClick={() => go('forgot')}>Forgot password?</button>}
          <button type="button" className="btn ghost" onClick={() => go(mode === 'signin' ? 'signup' : 'signin')}>
            {mode === 'signin' ? 'First time here? Create an account' : 'Back to sign in'}
          </button>
        </form>
        {msg && <p className="convert-preview small" style={{ marginTop: 12 }}>{msg}</p>}
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

// Shown after opening a reset-password email link (the link signs you in just for this).
export function ResetPassword() {
  const { endRecovery } = useStore()
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setErr('')
    if (pw !== pw2) return setErr('The two passwords don’t match.')
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password: pw })
    setBusy(false)
    error ? setErr(error.message) : setDone(true)
  }

  return (
    <div className="page login">
      <div className="logo"><span className="ps">PS.</span> <span className="eu">Europe</span></div>
      <div className="card">
        {done ? (
          <div className="form">
            <h2>Password updated ✅</h2>
            <p className="muted">If you use the Home Screen app, open it now and sign in with your new password.</p>
            <button className="btn primary" onClick={endRecovery}>Continue to the app</button>
          </div>
        ) : (
          <form className="form" onSubmit={submit}>
            <h2>Choose a new password 🔑</h2>
            <input type="password" required minLength={6} autoComplete="new-password" placeholder="New password (6+ characters)" value={pw} onChange={(e) => setPw(e.target.value)} />
            <input type="password" required minLength={6} autoComplete="new-password" placeholder="Type it again" value={pw2} onChange={(e) => setPw2(e.target.value)} />
            <button className="btn primary" disabled={busy}>{busy ? '…' : 'Save new password'}</button>
          </form>
        )}
        {err && <p className="error small">{err}</p>}
      </div>
    </div>
  )
}
