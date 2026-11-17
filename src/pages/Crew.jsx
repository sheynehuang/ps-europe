import { useState } from 'react'
import { Send, Share2 } from 'lucide-react'
import { useStore } from '../data/store'
import { ago } from '../lib/dates'
import { PageHeader, Avatar, FormSheet, Seg } from '../components/ui'

const COL = { items: 'plan', places: 'place', expenses: 'expense', memories: 'memory', docs: 'document', emergency: 'emergency info' }

export default function Crew() {
  const { db, me, add, update, setSettings, person } = useStore()
  const [email, setEmail] = useState('')
  const [editing, setEditing] = useState(null)
  const [who, setWho] = useState('all')
  const log = db.log.filter((l) => who === 'all' || l.userId === who)

  const invite = (e) => {
    e.preventDefault()
    add('invites', { email, status: 'pending' })
    setEmail('')
  }
  const share = async () => {
    const data = { title: 'PS. Europe', text: `Join our trip "${db.trip.name}" on PS. Europe!`, url: location.href.split('#')[0] }
    try { navigator.share ? await navigator.share(data) : (await navigator.clipboard.writeText(data.url), alert('Link copied!')) } catch { /* user cancelled */ }
  }

  return (
    <div className="page">
      <PageHeader back kicker="the dream team" title="Travel Crew" />

      <section className="card">
        <h3>You’re using the app as</h3>
        <Seg value={me.id} onChange={(v) => setSettings({ currentUser: v })} options={db.crew.map((u) => ({ v: u.id, l: `${u.emoji} ${u.name}` }))} />
        <p className="muted small">Switch to see how edits get attributed. Real sign-in arrives when Supabase is connected.</p>
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
          <input type="email" required placeholder="friend@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn primary" aria-label="Send invite"><Send size={18} /></button>
        </form>
        {db.invites.map((i) => <p key={i.id} className="muted small">✉️ {i.email} — {i.status}</p>)}
        <button className="btn ghost wide" onClick={share}><Share2 size={16} /> Share trip link</button>
        <p className="muted small">Invites are recorded here; sending emails needs the Supabase backend.</p>
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
