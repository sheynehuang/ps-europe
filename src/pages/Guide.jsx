import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'
import { useStore } from '../data/store'
import { seed } from '../data/seed'
import { PageHeader } from '../components/ui'

const S = seed()
const SEED_ITEMS = new Set(S.items.map((i) => i.id))
const SEED_EXPENSES = new Set(S.expenses.map((e) => e.id))
const standalone = () => navigator.standalone === true || matchMedia('(display-mode: standalone)').matches

// Setup steps in the recommended order. `auto` = the app can tell it's done; otherwise the user marks it.
export const STEPS = [
  { key: 'home', emoji: '📲', title: 'Add the app to your Home Screen',
    why: 'It opens full screen with one tap, like a real app, and you stay signed in.',
    how: 'Open this site in Safari → tap Share → Add to Home Screen.',
    auto: () => standalone(), personal: true },
  { key: 'trip', emoji: '🗓️', title: 'Set your trip dates',
    why: 'The countdown, total days and every “Day 1, Day 2…” are counted from these dates, so set them first.',
    how: 'On the Plan page, tap the glowing “✏️ Trip dates” button (top right) and enter your start and end dates.',
    to: '/plan?hint=trip' },
  { key: 'cities', emoji: '🗺️', title: 'Set up your city route',
    why: 'Plans are grouped by city. Set your cities and their dates first, and new plans will land in the right city automatically.',
    how: 'Tap a city’s coloured header to edit it, or “+ City” to add one. After changing a city name, tap “📍 Find on map” so it shows up on the map.',
    to: '/plan?hint=city' },
  { key: 'clear', emoji: '🧹', title: 'Clear the sample data',
    why: 'Do this once your cities are set: it removes the 29 sample plans and 10 sample expenses in one go. Cities, crew, checklist and emergency info are kept.',
    how: 'On the More page, tap the glowing “🧹 Clear sample data”. This affects the whole crew and can’t be undone.',
    to: '/more?hint=clear',
    auto: (db) => !db.items.some((i) => SEED_ITEMS.has(i.id)) && !db.expenses.some((e) => SEED_EXPENSES.has(e.id)) },
  { key: 'bookings', emoji: '✈️', title: 'Add your flights and stays',
    why: 'They show up in your Travel Wallet automatically, so booking codes are one tap away at the airport or hotel desk.',
    how: 'On the Plan page, tap the glowing + (bottom right), choose Flight, Train or Stay, and fill in the Confirmation code.',
    to: '/plan?hint=add',
    auto: (db) => db.items.some((i) => !SEED_ITEMS.has(i.id) && ['flight', 'train', 'hotel'].includes(i.type)) },
  { key: 'money', emoji: '💸', title: 'Log your first expense',
    why: 'Tip: tap “Fetch latest” in Tools → Currency once, and rates fill in automatically when you log expenses. Split with just one person = a personal expense.',
    how: 'On the Money page, tap the glowing + (bottom right).',
    to: '/money?hint=add',
    auto: (db) => db.expenses.some((e) => !SEED_EXPENSES.has(e.id)) },
  { key: 'sos', emoji: '🆘', title: 'Fill in emergency info',
    why: 'Look up your insurance 24h hotline and the Taiwan representative office numbers before you fly, so you can call with one tap.',
    how: 'In Travel Wallet → Emergency, tap any “Tap to add” entry and enter the number.',
    to: '/wallet?tab=sos' },
]

export function useGuide() {
  const { db, setSettings } = useStore()
  const marks = db.settings.guide || {}
  const steps = STEPS.map((s) => ({ ...s, done: !!(s.auto?.(db) || (!s.personal && marks[s.key])) }))
  const mark = (key, done) => setSettings({ guide: { ...marks, [key]: done } })
  return { steps, doneCount: steps.filter((s) => s.done).length, mark }
}

export default function Guide() {
  const { steps, doneCount, mark } = useGuide()
  const next = steps.find((s) => !s.done)
  return (
    <div className="page">
      <PageHeader back kicker="step by step" title="Getting started" />
      <section className="card guide-progress">
        <div className="section-head tight"><h3>{doneCount === steps.length ? 'All set — bon voyage! 🎉' : 'Set up your trip'}</h3><b>{doneCount}/{steps.length}</b></div>
        <span className="bar"><i style={{ width: `${(doneCount / steps.length) * 100}%` }} /></span>
        <p className="muted small">Go in order for the smoothest setup. Steps tick themselves when done, or tap “Mark as done”. Progress is shared with your crew, except the Home Screen step, which is per phone.</p>
      </section>

      <div className="stack">
        {steps.map((s, i) => (
          <section key={s.key} className={`guide-step ${s.done ? 'done' : ''} ${s === next ? 'next' : ''}`}>
            <div className="guide-top">
              <span className={`guide-num ${s.done ? 'on' : ''}`}>{s.done ? <Check size={16} /> : i + 1}</span>
              <span className="guide-emoji">{s.emoji}</span>
              <b className="grow">{s.title}</b>
            </div>
            {!s.done && (
              <>
                <p className="guide-why">💡 {s.why}</p>
                <p className="guide-how">👉 {s.how}</p>
                <div className="link-row">
                  {s.to && <Link className="btn primary sm" to={s.to}>Go <ArrowRight size={14} /></Link>}
                  {!s.auto && <button className="btn ghost sm" onClick={() => mark(s.key, true)}>Mark as done</button>}
                </div>
              </>
            )}
            {s.done && !s.auto && <button className="link small" onClick={() => mark(s.key, false)}>Undo</button>}
          </section>
        ))}
      </div>
    </div>
  )
}

// Compact progress card for the Home page.
export function GuideCard() {
  const { steps, doneCount } = useGuide()
  const [hidden, setHidden] = useState(() => !!localStorage.getItem('ps-guide-hidden'))
  const next = steps.find((s) => !s.done)
  if (!next || hidden) return null
  return (
    <div className="guide-card">
      <Link to="/guide" className="guide-link">
        <span className="guide-emoji">🧭</span>
        <span className="grow">
          <b>Set up your trip · {doneCount}/{steps.length}</b>
          <span className="muted small">Next: {next.emoji} {next.title}</span>
        </span>
        <ArrowRight size={18} />
      </Link>
      <button className="guide-x" aria-label="Hide guide" title="Hide (reopen it from the More page)"
        onClick={() => { localStorage.setItem('ps-guide-hidden', '1'); setHidden(true) }}>×</button>
    </div>
  )
}
