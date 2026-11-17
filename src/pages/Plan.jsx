import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useStore } from '../data/store'
import { eachDay, daysBetween, fmt, fmtShort, byDateTime } from '../lib/dates'
import ItemCard from '../components/ItemCard'
import ItemSheet from '../components/ItemSheet'
import { PageHeader, Fab, Chip } from '../components/ui'

export default function Plan() {
  const { db } = useStore()
  const [params, setParams] = useSearchParams()
  const [editing, setEditing] = useState(null)
  const sel = params.get('city') || 'all'
  const cities = db.cities.filter((c) => sel === 'all' || c.id === sel)

  return (
    <div className="page">
      <PageHeader kicker="day by day" title="Itinerary" />

      <div className="hscroll pills">
        <button className={`pill ${sel === 'all' ? 'on' : ''}`} onClick={() => setParams({})}>🗺️ All</button>
        {db.cities.map((c) => (
          <button key={c.id} className={`pill ${sel === c.id ? 'on' : ''}`} onClick={() => setParams({ city: c.id })}>{c.flag} {c.name}</button>
        ))}
      </div>

      {cities.map((c) => {
        const isLast = c.id === db.cities.at(-1).id
        const mine = db.items.filter((i) => i.cityId === c.id).sort(byDateTime)
        // Transit days belong to the city you arrive in, so a city's range excludes its departure day (except the last).
        const range = eachDay(c.start, c.end).slice(0, isLast ? undefined : -1)
        const days = [...new Set([...range, ...mine.map((i) => i.date)])].sort()
        return (
          <section key={c.id} className="city-block">
            <div className={`city-head ${c.tone}`}>
              <span className="flag big">{c.flag}</span>
              <div className="grow"><h2>{c.name}</h2><span>{c.country} · {fmtShort(c.start)} – {fmtShort(c.end)}</span></div>
              <Chip tone="cream">{daysBetween(c.start, c.end)} nights</Chip>
            </div>
            {days.map((d) => {
              const list = mine.filter((i) => i.date === d)
              return (
                <div key={d} className="day">
                  <div className="day-head">
                    <span className="day-num">Day {daysBetween(db.trip.start, d) + 1}</span>
                    <span className="muted">{fmt(d)}</span>
                    <button className="icon-btn sm" aria-label={`Add to ${fmt(d)}`} onClick={() => setEditing({ date: d, cityId: c.id })}><Plus size={16} /></button>
                  </div>
                  {list.length ? (
                    <div className="stack">{list.map((i) => <ItemCard key={i.id} item={i} onClick={() => setEditing(i)} />)}</div>
                  ) : (
                    <button className="day-empty" onClick={() => setEditing({ date: d, cityId: c.id })}>Free day ✨ tap to plan something</button>
                  )}
                </div>
              )
            })}
          </section>
        )
      })}

      <Fab label="Add to plan" onClick={() => setEditing(sel === 'all' ? {} : { cityId: sel, date: db.cities.find((c) => c.id === sel).start })} />
      {editing && <ItemSheet item={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
