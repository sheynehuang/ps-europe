import { useState } from 'react'
import { supabase } from '../data/backend'
import { useStore } from '../data/store'
import HeroArt from '../components/HeroArt'

// Email + password: the free Supabase mailer can't send codes, and email links open in Safari,
// not the home-screen app. So email is only used once, to confirm the account.
export default function Login() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr(''); setMsg('')
    const creds = { email: email.trim().toLowerCase(), password }
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword(creds)
        if (error) throw error
      } else {
        const { data, error } = await supabase.auth.signUp({ ...creds, options: { emailRedirectTo: location.origin + location.pathname } })
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
          <h2>{mode === 'signin' ? 'Hello, traveller 👋' : 'Join the crew ✨'}</h2>
          <p className="muted">{mode === 'signin' ? 'Sign in to your shared trip.' : 'First time? Create your account with the email you were invited with.'}</p>
          <input type="email" required autoComplete="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" required minLength={6} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} placeholder="Password (6+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="btn primary" disabled={busy}>{busy ? '…' : mode === 'signin' ? 'Sign in' : 'Create account'}</button>
          <button type="button" className="btn ghost" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setErr(''); setMsg('') }}>
            {mode === 'signin' ? 'First time here? Create an account' : 'Already have an account? Sign in'}
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
