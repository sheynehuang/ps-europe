import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Pencil, MapPinned } from 'lucide-react'
import { useStore } from '../data/store'
import { eachDay, daysBetween, fmt, fmtShort, byDateTime, addDays, today } from '../lib/dates'
import { COUNTRIES, codeOf, flagOf, geocode } from '../lib/countries'
import ItemCard from '../components/ItemCard'
import ItemSheet from '../components/ItemSheet'
import { PageHeader, Fab, Chip, FormSheet, Empty } from '../components/ui'

const TONES = ['peach', 'blue', 'pink', 'yellow', 'green']

function CoordsField({ f, set }) {
  const [state, setState] = useState('')
  const find = async () => {
    if (!f.name) return setState('Type the city name first')
    setState('Searching…')
    try {
      const hit = await geocode(f.name, f.country)
      if (!hit) return setState('Not found — check the spelling')
      set('lat', hit.lat); set('lng', hit.lng); setState('Found ✓')
    } catch { setState('No connection — try again later') }
  }
  return (
    <div className="coords">
      <button type="button" className="btn ghost sm" onClick={find}><MapPinned size={15} /> Find on map</button>
      <span className="muted small">{state || (f.lat ? `${f.lat}, ${f.lng}` : 'Needed to show the city on the map')}</span>
    </div>
  )
}

function CitySheet({ city, onClose }) {
  const { db, add, update, updateMany, remove } = useStore()
  const last = db.cities.at(-1)
  const initial = { country: 'France', tone: TONES[db.cities.length % TONES.length], start: last?.end ?? db.trip.start, end: last?.end ?? db.trip.start, ...city }
  const plans = city.id ? db.items.filter((i) => i.cityId === city.id).length : 0
  return (
    <FormSheet
      title={city.id ? `Edit ${city.name}` : 'Add a city'}
      initial={initial}
      onClose={onClose}
      fields={(f) => [
        { k: 'name', label: 'City', required: true, placeholder: 'Vienna' },
        { k: 'country', label: 'Country', options: COUNTRIES.map((c) => ({ v: c.name, l: `${flagOf(c.code)} ${c.name}` })) },
        { row: [
          { k: 'start', label: 'Arrive', type: 'date', required: true, hint: plans ? 'Change it and you can move this city’s plans too' : undefined },
          { k: 'end', label: 'Leave', type: 'date', required: true, min: f.start },
        ] },
        { k: 'coords', label: 'Map location', render: (f, set) => <CoordsField f={f} set={set} /> },
        { k: 'tone', label: 'Colour', render: (f, set) => (
          <div className="type-pick">{TONES.map((t) => <button type="button" key={t} aria-label={t} className={`chip ${t} swatch ${f.tone === t ? 'on' : ''}`} onClick={() => set('tone', t)} />)}</div>
        ) },
      ]}
      onSave={(f) => {
        if (!f.lat) alert('Saved without a map location — tap "Find on map" later to show it on the map.')
        const row = { ...f, flag: flagOf(codeOf(f.country)) }
        delete row.coords
        city.id ? update('cities', city.id, row) : add('cities', row)
        // Moving the arrival date can carry the city's plans along by the same number of days.
        const shift = city.id ? daysBetween(city.start, f.start) : 0
        const mine = db.items.filter((i) => i.cityId === city.id)
        if (shift && mine.length && confirm(`Move ${mine.length} plan${mine.length > 1 ? 's' : ''} in ${f.name} ${Math.abs(shift)} day${Math.abs(shift) > 1 ? 's' : ''} ${shift > 0 ? 'later' : 'earlier'} too?`)) {
          updateMany('items', mine.map((i) => ({ ...i, date: addDays(i.date, shift) })))
        }
      }}
      onDelete={city.id && (() => (plans ? alert(`${city.name} still has ${plans} plans. Move or delete them first.`) : remove('cities', city.id)))}
    />
  )
}

function TripSheet({ onClose }) {
  const { db, setTrip, setSettings } = useStore()
  return (
    <FormSheet title="Edit trip" initial={db.trip} onClose={onClose}
      fields={(f) => [
        { k: 'name', label: 'Trip name', required: true },
        { row: [
          { k: 'start', label: 'Start', type: 'date', required: true },
          { k: 'end', label: 'End', type: 'date', required: true, min: f.start },
        ] },
        { k: 'budgetTWD', label: 'Budget (TWD, everyone)', type: 'number', min: 0 },
      ]}
      onSave={(f) => { setTrip({ ...f, budgetTWD: Number(f.budgetTWD) || 0 }); setSettings({ guide: { ...db.settings.guide, trip: true } }) }} />
  )
}

export default function Plan() {
  const { db } = useStore()
  const [params, setParams] = useSearchParams()
  const [editing, setEditing] = useState(null)
  const [cityEdit, setCityEdit] = useState(null)
  const [tripEdit, setTripEdit] = useState(false)
  const sel = params.get('city') || 'all'
  const hint = params.get('hint')
  const cities = db.cities.filter((c) => sel === 'all' || c.id === sel)
  const selCity = db.cities.find((c) => c.id === sel)
  const t = today()
  const inTrip = t >= db.trip.start && t <= db.trip.end
  const jumpToday = () => document.getElementById(`day-${t}`)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  useEffect(() => { if (params.get('today') && inTrip) setTimeout(jumpToday, 450) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="page">
      <PageHeader kicker="day by day" title="Itinerary"
        right={<button className={`btn ghost sm ${hint === 'trip' ? 'hint' : ''}`} onClick={() => setTripEdit(true)}><Pencil size={14} /> Trip dates</button>} />
      <p className="muted small trip-line">{db.trip.name} · {fmtShort(db.trip.start)} – {fmtShort(db.trip.end)} · {daysBetween(db.trip.start, db.trip.end) + 1} days</p>

      <div className="hscroll pills">
        {inTrip && <button className="pill today" onClick={() => { setParams({}); setTimeout(jumpToday, 100) }}>📍 Today</button>}
        <button className={`pill ${sel === 'all' ? 'on' : ''}`} onClick={() => setParams({})}>🗺️ All</button>
        {db.cities.map((c) => (
          <button key={c.id} className={`pill ${sel === c.id ? 'on' : ''}`} onClick={() => setParams({ city: c.id })}>{c.flag} {c.name}</button>
        ))}
        <button className={`pill ${hint === 'city' ? 'hint' : ''}`} onClick={() => setCityEdit({})}><Plus size={14} /> City</button>
      </div>

      {!db.cities.length && <Empty emoji="🗺️" title="Where are you going?" text="Add your first city to start planning." action={<button className="btn primary" onClick={() => setCityEdit({})}>Add a city</button>} />}

      {cities.map((c) => {
        const isLast = c.id === db.cities.at(-1).id
        const mine = db.items.filter((i) => i.cityId === c.id).sort(byDateTime)
        // Transit days belong to the city you arrive in, so a city's range excludes its departure day (except the last).
        const range = eachDay(c.start, c.end).slice(0, isLast ? undefined : -1)
        const days = [...new Set([...range, ...mine.map((i) => i.date)])].sort()
        return (
          <section key={c.id} className="city-block">
            <button className={`city-head ${c.tone}`} onClick={() => setCityEdit(c)} aria-label={`Edit ${c.name}`}>
              <span className="flag big">{c.flag}</span>
              <div className="grow"><h2>{c.name}</h2><span>{c.country} · {fmtShort(c.start)} – {fmtShort(c.end)}</span></div>
              <Chip tone="cream">{daysBetween(c.start, c.end)} nights <Pencil size={12} /></Chip>
            </button>
            {days.map((d) => {
              const list = mine.filter((i) => i.date === d)
              return (
                <div key={d} id={`day-${d}`} className={`day ${d === t ? 'is-today' : ''}`}>
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

      {db.cities.length > 0 && <button className="day-empty add-city" onClick={() => setCityEdit({})}><Plus size={16} /> Add another city</button>}

      <Fab label="Add to plan" hint={hint === 'add'} onClick={() => setEditing(selCity ? { cityId: selCity.id, date: selCity.start } : {})} />
      {editing && <ItemSheet item={editing} onClose={() => setEditing(null)} />}
      {cityEdit && <CitySheet city={cityEdit} onClose={() => setCityEdit(null)} />}
      {tripEdit && <TripSheet onClose={() => setTripEdit(false)} />}
    </div>
  )
}
