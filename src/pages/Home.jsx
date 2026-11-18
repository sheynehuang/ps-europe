import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Plane, ArrowRight, Cloud, CloudOff, Wallet, BookHeart, Users, Wrench, Compass, PiggyBank } from 'lucide-react'
import { useStore } from '../data/store'
import { today, daysBetween, fmt, fmtShort, byDateTime, ago } from '../lib/dates'
import { BOOKING_TYPES } from '../lib/meta'
import HeroArt from '../components/HeroArt'
import { GuideCard } from './Guide'
import ItemCard from '../components/ItemCard'
import ItemSheet from '../components/ItemSheet'
import { Avatar, Chip } from '../components/ui'

const QUICK = [
  { to: '/explore', label: 'Explore', icon: Compass, tone: 'green' },
  { to: '/money', label: 'Expenses', icon: PiggyBank, tone: 'peach' },
  { to: '/wallet', label: 'Wallet', icon: Wallet, tone: 'blue' },
  { to: '/memories', label: 'Memories', icon: BookHeart, tone: 'pink' },
  { to: '/crew', label: 'Crew', icon: Users, tone: 'yellow' },
  { to: '/tools', label: 'Tools', icon: Wrench, tone: 'green' },
]

export function Countdown({ trip }) {
  const t = today()
  const total = daysBetween(trip.start, trip.end) + 1
  const toGo = daysBetween(t, trip.start)
  if (toGo > 0) return <><span className="big-num">{toGo}</span><span className="script big-label">{toGo === 1 ? 'day to go' : 'days to go'}</span></>
  if (t <= trip.end) return <><span className="big-num">{daysBetween(trip.start, t) + 1}</span><span className="script big-label">of {total} days</span></>
  return <><span className="big-num">✓</span><span className="script big-label">what a trip!</span></>
}

export default function Home() {
  const { db, me, person, status, pending } = useStore()
  const nav = useNavigate()
  const [editing, setEditing] = useState(null)
  const { trip, cities, items } = db
  const total = daysBetween(trip.start, trip.end) + 1
  const flags = [...new Map(cities.map((c) => [c.country, c.flag])).values()]
  const bookings = items.filter((i) => BOOKING_TYPES.includes(i.type)).length
  const upcoming = items.filter((i) => i.date >= today()).sort(byDateTime).slice(0, 4)

  return (
    <div className="page">
      <header className="topbar">
        <div className="logo"><span className="ps">PS.</span> <span className="eu">Europe</span></div>
        <span className={`sync ${status}`} title={pending ? `${pending} changes waiting to sync` : status}>
          {status === 'offline' ? <CloudOff size={16} /> : <Cloud size={16} />}
          {pending > 0 ? pending : status === 'synced' ? '✓' : status === 'offline' ? 'offline' : '…'}
        </span>
        <Link to="/crew" className="avatars" aria-label="Travel crew">{db.crew.map((u) => <Avatar key={u.id} id={u.id} size={38} />)}</Link>
      </header>

      <div className="script hello">Bonjour, {me.name} <span className="wave">👋</span></div>
      <h1 className="display xl">{trip.name}</h1>
      <GuideCard />

      <section className="hero">
        <HeroArt />
        <div className="hero-panel">
          <div className="count-row">
            <div><Countdown trip={trip} /></div>
            <button className="plane-btn" onClick={() => nav('/plan')} aria-label="Open itinerary"><Plane size={30} /></button>
          </div>
          <p className="muted">Wheels up {fmt(trip.start)}</p>
          <div className="chips">
            <Chip tone="peach">{fmtShort(trip.start)} – {fmtShort(trip.end)}</Chip>
            <Chip tone="green">{total} days</Chip>
            <Chip tone="pink">{flags.join(' ')}</Chip>
          </div>
        </div>
      </section>

      <section className="stats">
        <Link to="/plan" className="stat peach"><b>{total}</b><span>Days total</span><i>🗓️</i></Link>
        <Link to="/explore" className="stat green"><b>{flags.length}</b><span>Countries</span><i>🌍</i></Link>
        <Link to="/plan" className="stat pink"><b>{cities.length}</b><span>Cities</span><i>🏙️</i></Link>
        <Link to="/wallet" className="stat blue"><b>{bookings}</b><span>Bookings</span><i>🎫</i></Link>
      </section>

      <div className="section-head"><h2>The route</h2><Link to="/plan">Itinerary <ArrowRight size={16} /></Link></div>
      <div className="hscroll">
        {cities.map((c, i) => (
          <Link key={c.id} to={`/plan?city=${c.id}`} className="city-card">
            <span className="city-top"><span className="flag">{c.flag}</span><span className={`num ${c.tone}`}>{i + 1}</span></span>
            <b>{c.name}</b>
            <span className="muted">{c.country}</span>
            <Chip tone={c.tone}>{fmtShort(c.start)} – {fmtShort(c.end)}</Chip>
          </Link>
        ))}
      </div>

      <div className="section-head"><h2>Up next</h2><Link to="/plan">See all <ArrowRight size={16} /></Link></div>
      <div className="stack">
        {upcoming.map((i) => <ItemCard key={i.id} item={i} showDate onClick={() => setEditing(i)} />)}
      </div>

      <div className="section-head"><h2>Quick access</h2></div>
      <div className="quick">
        {QUICK.map(({ to, label, icon: Icon, tone }) => (
          <Link key={to} to={to} className={`quick-tile ${tone}`}><Icon size={24} /><span>{label}</span></Link>
        ))}
      </div>

      <div className="section-head"><h2>Crew activity</h2><Link to="/crew">All <ArrowRight size={16} /></Link></div>
      <div className="card feed">
        {db.log.slice(0, 3).map((l) => (
          <div key={l.id} className="feed-row">
            <Avatar id={l.userId} size={30} />
            <p><b>{person(l.userId)?.name}</b> {l.action} <i>{l.title}</i><small>{ago(l.at)}</small></p>
          </div>
        ))}
      </div>

      {editing && <ItemSheet item={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
