import { useState } from 'react'
import { Send, Share2, LogOut } from 'lucide-react'
import { useStore } from '../data/store'
import { ago } from '../lib/dates'
import { PageHeader, Avatar, FormSheet, Seg } from '../components/ui'

const COL = { items: 'plan', places: 'place', expenses: 'expense', memories: 'memory', docs: 'document', emergency: 'emergency info' }

export default function Crew() {
  const { db, me, update, person, email: myEmail, invite: sendInvite, signOut, pending } = useStore()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [invited, setInvited] = useState('')
  const [editing, setEditing] = useState(null)
  const [who, setWho] = useState('all')
  const log = db.log.filter((l) => who === 'all' || l.userId === who)

  const invite = async (e) => {
    e.preventDefault()
    if (await sendInvite(email, name)) { setInvited(name); setEmail(''); setName('') }
  }
  const share = async () => {
    const data = { title: 'PS. Europe', text: `Join our trip "${db.trip.name}" on PS. Europe!`, url: location.href.split('#')[0] }
    try { navigator.share ? await navigator.share(data) : (await navigator.clipboard.writeText(data.url), alert('Link copied!')) } catch { /* user cancelled */ }
  }

  return (
    <div className="page">
      <PageHeader back kicker="the dream team" title="Travel Crew" />

      <section className="card signed-in">
        <Avatar id={me.id} size={40} />
        <span className="grow"><b>Signed in as {me.name}</b><span className="muted small">{myEmail}{pending > 0 && ` · ${pending} changes waiting to sync`}</span></span>
        <button className="icon-btn" onClick={() => confirm('Sign out?') && signOut()} aria-label="Sign out"><LogOut size={18} /></button>
      </section>

      <div className="stack">
        {db.crew.map((u) => (
          <button key={u.id} className="member" onClick={() => setEditing(u)}>
            <Avatar id={u.id} size={52} />
            <span className="grow"><b>{u.name}{u.id === me.id && ' (you)'}</b><span className="muted">{u.role}</span></span>
            <span className="muted small">{db.items.filter((i) => i.createdBy === u.id).length} plans added</span>
          </button>
        ))}
      </div>

      <section className="card">
        <h3>Invite a travel companion</h3>
        <form className="invite" onSubmit={invite}>
          <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={{ maxWidth: 110 }} />
          <input type="email" required placeholder="friend@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn primary" aria-label="Send invite"><Send size={18} /></button>
        </form>
        {invited && <p className="convert-preview small" style={{ marginTop: 10 }}>🎉 {invited} is invited! Share the link and ask them to create an account with that email.</p>}
        <button className="btn ghost wide" onClick={share}><Share2 size={16} /> Share trip link</button>
        <p className="muted small">Emails stay private — the crew only sees names.</p>
      </section>

      <div className="section-head"><h2>Activity</h2></div>
      <Seg small value={who} onChange={setWho} options={[{ v: 'all', l: 'Everyone' }, ...db.crew.map((u) => ({ v: u.id, l: `${u.emoji} ${u.name}` }))]} />
      <div className="card feed">
        {log.map((l) => (
          <div key={l.id} className="feed-row">
            <Avatar id={l.userId} size={30} />
            <p><b>{person(l.userId)?.name}</b> {l.action} {COL[l.col] ?? ''} <i>{l.title}</i><small>{ago(l.at)}</small></p>
          </div>
        ))}
        {!log.length && <p className="muted">Nothing yet.</p>}
      </div>

      {editing && (
        <FormSheet title="Edit crew member" initial={editing} onClose={() => setEditing(null)}
          fields={[
            { row: [{ k: 'emoji', label: 'Emoji', grow: 1 }, { k: 'name', label: 'Name', required: true, grow: 3 }] },
            { k: 'role', label: 'Trip role', placeholder: 'Map reader, snack scout…' },
            { k: 'color', label: 'Colour', type: 'color' },
          ]}
          onSave={(f) => update('crew', editing.id, f)} />
      )}
    </div>
  )
}
