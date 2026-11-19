import { Link, useSearchParams } from 'react-router-dom'
import { Wallet, BookHeart, Users, Wrench } from 'lucide-react'
import { useStore } from '../data/store'
import { PageHeader } from '../components/ui'

const TILES = [
  { to: '/wallet', label: 'Travel Wallet', sub: 'Tickets, stays, documents & SOS', icon: Wallet, tone: 'blue', emoji: '🎫' },
  { to: '/memories', label: 'Memories', sub: 'Daily journal & photos', icon: BookHeart, tone: 'pink', emoji: '📸' },
  { to: '/crew', label: 'Travel Crew', sub: 'Who’s in and who changed what', icon: Users, tone: 'yellow', emoji: '👯' },
  { to: '/tools', label: 'Travel Tools', sub: 'Currency, flights, checklist, wishlist', icon: Wrench, tone: 'green', emoji: '🧰' },
]

export default function More() {
  const { reset, clearSample } = useStore()
  const [params] = useSearchParams()
  return (
    <div className="page">
      <PageHeader kicker="everything else" title="More" />
      <div className="more-grid">
        {TILES.map(({ to, label, sub, icon: Icon, tone, emoji }) => (
          <Link key={to} to={to} className={`more-tile ${tone}`}>
            <span className="more-emoji">{emoji}</span>
            <Icon size={22} />
            <b>{label}</b>
            <span>{sub}</span>
          </Link>
        ))}
      </div>
      <Link to="/guide" className="guide-card guide-link more-guide"><span className="guide-emoji">🧭</span><span className="grow"><b>Getting started</b><span className="muted small">Set up your real trip, step by step</span></span></Link>
      <button className={`btn primary wide ${params.get('hint') === 'clear' ? 'hint' : ''}`} onClick={() => confirm('Delete all sample plans, places, expenses, memories and documents for everyone? Cities, crew, checklist and emergency info stay.') && clearSample()}>🧹 Clear sample data — start our real trip</button>
      <p className="muted center small">Synced to the cloud for the whole crew.</p>
      <button className="btn ghost danger wide danger-zone" onClick={() => confirm('⚠️ This REPLACES your whole trip — every plan, place, expense, memory and document — with the demo trip, for everyone. Your real data will be gone. Continue?') && reset()}>⚠️ Replace everything with the demo trip</button>
    </div>
  )
}
