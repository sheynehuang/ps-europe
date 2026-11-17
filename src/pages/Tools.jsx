import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { ArrowLeftRight, RefreshCw, ExternalLink, Trash2, Check } from 'lucide-react'
import { useStore } from '../data/store'
import { CURRENCIES, fetchRates } from '../lib/rates'
import { convert, fmtMoney } from '../lib/money'
import { PLACE_CATS } from '../lib/meta'
import { fmt, byDateTime } from '../lib/dates'
import { PageHeader, Seg, Empty } from '../components/ui'

function Converter() {
  const { db, setSettings } = useStore()
  const { rates, ratesDate, ratesSource } = db.settings
  const [amt, setAmt] = useState(10)
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('TWD')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const out = convert(Number(amt) || 0, from, to, rates)

  const refresh = async () => {
    setBusy(true); setErr('')
    try { setSettings(await fetchRates()) } catch { setErr('Couldn’t reach the rate service. Check your connection or enter rates below.') }
    setBusy(false)
  }

  return (
    <>
      <section className="card conv">
        <label className="field"><span>Amount</span><input type="number" inputMode="decimal" value={amt} onChange={(e) => setAmt(e.target.value)} /></label>
        <div className="conv-row">
          <select value={from} onChange={(e) => setFrom(e.target.value)}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
          <button className="icon-btn" aria-label="Swap" onClick={() => { setFrom(to); setTo(from) }}><ArrowLeftRight size={18} /></button>
          <select value={to} onChange={(e) => setTo(e.target.value)}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
        </div>
        <div className="conv-out">
          {out === null ? <span className="muted">No rate for {from === 'TWD' ? to : from} yet — fetch or enter one below.</span>
            : <><b>{fmtMoney(out, to)}</b><span className="muted">{fmtMoney(Number(amt) || 0, from)}</span></>}
        </div>
      </section>

      <section className="card">
        <div className="section-head tight"><h3>Rates (TWD per unit)</h3>
          <button className="btn ghost sm" onClick={refresh} disabled={busy}><RefreshCw size={14} className={busy ? 'spin' : ''} /> {busy ? 'Fetching' : 'Fetch latest'}</button>
        </div>
        <p className="muted small">{ratesDate ? `From ${ratesSource}, updated ${new Date(ratesDate).toLocaleString('en-GB')}` : 'No rates saved yet. Fetch live rates (needs internet) or type your bank’s rate.'}</p>
        {err && <p className="error small">{err}</p>}
        <div className="rate-grid">
          {CURRENCIES.filter((c) => c !== 'TWD').map((c) => (
            <label key={c} className="field"><span>1 {c} =</span>
              <input type="number" step="any" min="0" inputMode="decimal" placeholder="— TWD" value={rates[c] ?? ''}
                onChange={(e) => setSettings({ rates: { ...rates, [c]: e.target.value === '' ? undefined : Number(e.target.value) }, ratesSource: 'manual entry', ratesDate: new Date().toISOString() })} />
            </label>
          ))}
        </div>
      </section>
    </>
  )
}

function Flights() {
  const { db } = useStore()
  const [q, setQ] = useState('')
  const flights = db.items.filter((i) => i.type === 'flight').sort(byDateTime)
  const links = (n) => {
    const code = n.replace(/\s/g, '').toUpperCase()
    return (
      <div className="link-row">
        <a className="btn ghost sm" href={`https://www.flightaware.com/live/flight/${code}`} target="_blank" rel="noreferrer">FlightAware <ExternalLink size={13} /></a>
        <a className="btn ghost sm" href={`https://www.google.com/search?q=${encodeURIComponent(code + ' flight status')}`} target="_blank" rel="noreferrer">Google <ExternalLink size={13} /></a>
      </div>
    )
  }
  return (
    <>
      <p className="notice">✈️ We don’t invent live data — these open real-time trackers for each flight.</p>
      <section className="card">
        <label className="field"><span>Check any flight</span><input value={q} placeholder="e.g. BR87" onChange={(e) => setQ(e.target.value)} /></label>
        {q.trim() && links(q)}
      </section>
      <div className="stack">
        {flights.map((f) => (
          <div key={f.id} className="card flight">
            <div className="flight-top"><b className="fnum">{f.number}</b><span className="muted">{fmt(f.date)} · {f.time}</span></div>
            <div className="ticket-route"><b>{f.from}</b><span className="dash">✈︎</span><b>{f.to}</b></div>
            {f.number && links(f.number)}
          </div>
        ))}
      </div>
    </>
  )
}

function Checklist() {
  const { db, add, update, remove } = useStore()
  const [text, setText] = useState('')
  const [group, setGroup] = useState('Packing')
  const groups = [...new Set(['Documents', 'Money', 'Tech', 'Packing', ...db.checklist.map((c) => c.group)])]
  const done = db.checklist.filter((c) => c.done).length
  const submit = (e) => { e.preventDefault(); if (text.trim()) { add('checklist', { text: text.trim(), group, done: false }); setText('') } }
  return (
    <>
      <section className="card">
        <div className="section-head tight"><h3>Ready to fly?</h3><b>{done}/{db.checklist.length}</b></div>
        <span className="bar"><i style={{ width: `${(done / Math.max(1, db.checklist.length)) * 100}%` }} /></span>
        <form className="invite" onSubmit={submit}>
          <input value={text} placeholder="Add an item…" onChange={(e) => setText(e.target.value)} />
          <select value={group} onChange={(e) => setGroup(e.target.value)}>{groups.map((g) => <option key={g}>{g}</option>)}</select>
          <button className="btn primary">Add</button>
        </form>
      </section>
      {groups.map((g) => {
        const list = db.checklist.filter((c) => c.group === g)
        return list.length > 0 && (
          <section key={g}>
            <div className="section-head"><h2>{g}</h2></div>
            <div className="card check-list">
              {list.map((c) => (
                <div key={c.id} className={`check-row ${c.done ? 'done' : ''}`}>
                  <button className={`check ${c.done ? 'on' : ''}`} onClick={() => update('checklist', c.id, { done: !c.done })} aria-label={c.done ? 'Uncheck' : 'Check'}><Check size={16} /></button>
                  <span className="grow">{c.text}</span>
                  <button className="icon-btn sm" onClick={() => remove('checklist', c.id)} aria-label="Delete"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </>
  )
}

function Wishlist() {
  const { db, update, city } = useStore()
  const wish = db.places.filter((p) => !p.visited && (p.category === 'restaurant' || p.category === 'attraction' || p.category === 'cafe'))
  if (!wish.length) return <Empty emoji="🎉" title="Wishlist complete!" text="Everything’s been visited." />
  return Object.entries(PLACE_CATS).map(([k, cat]) => {
    const list = wish.filter((p) => p.category === k)
    return list.length > 0 && (
      <section key={k}>
        <div className="section-head"><h2>{cat.emoji} {cat.label}</h2><Link to="/explore">Map →</Link></div>
        <div className="card check-list">
          {list.map((p) => (
            <div key={p.id} className="check-row">
              <button className="check" onClick={() => update('places', p.id, { visited: true })} aria-label="Mark visited"><Check size={16} /></button>
              <span className="grow">{p.name}<small className="muted"> · {city(p.cityId)?.flag} {city(p.cityId)?.name}</small></span>
            </div>
          ))}
        </div>
      </section>
    )
  })
}

const TABS = { convert: ['💱 Currency', Converter], flights: ['✈️ Flights', Flights], check: ['✅ Checklist', Checklist], wish: ['💖 Wishlist', Wishlist] }

export default function Tools() {
  const [params, setParams] = useSearchParams()
  const tab = TABS[params.get('tab')] ? params.get('tab') : 'convert'
  const View = TABS[tab][1]
  return (
    <div className="page">
      <PageHeader back kicker="handy helpers" title="Travel Tools" />
      <div className="hscroll pills">
        {Object.entries(TABS).map(([k, [l]]) => <button key={k} className={`pill ${tab === k ? 'on' : ''}`} onClick={() => setParams({ tab: k })}>{l}</button>)}
      </div>
      <View />
    </div>
  )
}
