import { Link } from 'react-router-dom'
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
  const { reset } = useStore()
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
      <button className="btn ghost danger wide" onClick={() => confirm('Reset all data back to the demo trip?') && reset()}>Reset demo data</button>
      <p className="muted center small">Data is saved on this device only for now.</p>
    </div>
  )
}
