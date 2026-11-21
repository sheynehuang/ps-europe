import { Link, useSearchParams } from 'react-router-dom'
import { Wallet, BookHeart, Users, Wrench } from 'lucide-react'
import { useStore } from '../data/store'
import { PageHeader } from '../components/ui'
import { useGuide } from './Guide'

const TILES = [
  { to: '/wallet', label: 'Travel Wallet', sub: 'Tickets, stays, documents & SOS', icon: Wallet, tone: 'blue', emoji: '🎫' },
  { to: '/memories', label: 'Memories', sub: 'Daily journal & photos', icon: BookHeart, tone: 'pink', emoji: '📸' },
  { to: '/crew', label: 'Travel Crew', sub: 'Who’s in and who changed what', icon: Users, tone: 'yellow', emoji: '👯' },
  { to: '/tools', label: 'Travel Tools', sub: 'Currency, flights, checklist, wishlist', icon: Wrench, tone: 'green', emoji: '🧰' },
]

export default function More() {
  const { reset, clearSample } = useStore()
  const [params] = useSearchParams()
  const { steps, doneCount } = useGuide()
  // One-time setup items only show while they're still needed.
  const setupDone = doneCount === steps.length
  const hasSample = !steps.find((s) => s.key === 'clear').done
  const guideLink = <Link to="/guide" className="guide-card guide-link more-guide"><span className="guide-emoji">🧭</span><span className="grow"><b>Getting started</b><span className="muted small">{setupDone ? 'All set — revisit the setup steps' : `Set up your real trip · ${doneCount}/${steps.length}`}</span></span></Link>
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
      {!setupDone && guideLink}
      {hasSample && <button className={`btn primary wide ${params.get('hint') === 'clear' ? 'hint' : ''}`} onClick={() => confirm('Delete all sample plans, places, expenses, memories and documents for everyone? Cities, crew, checklist and emergency info stay.') && clearSample()}>🧹 Clear sample data — start our real trip</button>}
      <details className="card fold advanced">
        <summary>Advanced</summary>
        {setupDone && guideLink}
        <p className="muted small">Synced to the cloud for the whole crew.</p>
        <button className="btn ghost danger wide" onClick={() => confirm('⚠️ This REPLACES your whole trip — every plan, place, expense, memory and document — with the demo trip, for everyone. Your real data will be gone. Continue?') && reset()}>⚠️ Replace everything with the demo trip</button>
      </details>
    </div>
  )
}
