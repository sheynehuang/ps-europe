import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ImagePlus, X } from 'lucide-react'
import { useStore, uid } from '../data/store'
import { uploadPhoto } from '../data/backend'
import { compress } from '../lib/images'
import { fmt, today } from '../lib/dates'
import { PageHeader, Fab, FormSheet, Empty, Who, Chip, Seg } from '../components/ui'

const MOODS = ['🥰', '🤩', '🥳', '😋', '😴', '🥶', '😅']

function Photos({ f, set }) {
  const [busy, setBusy] = useState(false)
  const onFiles = async (e) => {
    setBusy(true)
    try { set('photos', [...(f.photos || []), ...(await Promise.all([...e.target.files].map(async (x) => uploadPhoto(await compress(x), uid()))))]) }
    catch { alert('Could not read that photo.') }
    setBusy(false)
  }
  return (
    <div className="photo-pick">
      {(f.photos || []).map((p, i) => (
        <span key={i} className="thumb"><img src={p} alt="" />
          <button type="button" aria-label="Remove photo" onClick={() => set('photos', f.photos.filter((_, j) => j !== i))}><X size={14} /></button>
        </span>
      ))}
      <label className="thumb add">{busy ? '…' : <ImagePlus size={22} />}<input type="file" accept="image/*" multiple hidden onChange={onFiles} /></label>
    </div>
  )
}

export default function Memories() {
  const { db, add, update, remove, city } = useStore()
  const [params] = useSearchParams()
  const cityFor = (date) => db.cities.find((c) => date >= c.start && date < c.end)?.id ?? ''
  const blank = () => ({ date: today(), cityId: cityFor(today()), mood: '🥰', photos: [] })
  const [editing, setEditing] = useState(() => (params.get('new') ? blank() : null))
  const [cityId, setCityId] = useState('all')
  const list = db.memories.filter((m) => cityId === 'all' || m.cityId === cityId)
  const dates = [...new Set(list.map((m) => m.date))].sort().reverse()

  return (
    <div className="page">
      <PageHeader back kicker="dear diary" title="Memories" />
      <div className="hscroll pills">
        <button className={`pill ${cityId === 'all' ? 'on' : ''}`} onClick={() => setCityId('all')}>All</button>
        <button className={`pill ${cityId === '' ? 'on' : ''}`} onClick={() => setCityId('')}>🧳 Before</button>
        {db.cities.map((c) => <button key={c.id} className={`pill ${cityId === c.id ? 'on' : ''}`} onClick={() => setCityId(c.id)}>{c.flag} {c.name}</button>)}
      </div>

      {!list.length && <Empty emoji="📔" title="No memories here yet" text="Write today’s highlight — future you will thank you." />}
      {dates.map((d) => (
        <section key={d} className="memory-day">
          <div className="day-head"><span className="day-num">{fmt(d, { weekday: 'long', day: 'numeric', month: 'long' })}</span></div>
          {list.filter((m) => m.date === d).map((m) => (
            <button key={m.id} className="memory" onClick={() => setEditing(m)}>
              {m.photos?.length > 0 && <div className={`mgrid n${Math.min(m.photos.length, 3)}`}>{m.photos.slice(0, 3).map((p, i) => <img key={i} src={p} alt="" />)}</div>}
              <div className="memory-body">
                <div className="memory-top">
                  <span className="mood">{m.mood}</span>
                  <h3>{m.title}</h3>
                </div>
                <p>{m.text}</p>
                <div className="item-foot">
                  {m.cityId ? <Chip tone={city(m.cityId)?.tone}>{city(m.cityId)?.flag} {city(m.cityId)?.name}</Chip> : <Chip tone="cream">🧳 Pre-trip</Chip>}
                  <Who row={m} />
                </div>
              </div>
            </button>
          ))}
        </section>
      ))}

      <Fab label="New memory" onClick={() => setEditing(blank())} />
      {editing && (
        <FormSheet title={editing.id ? 'Edit memory' : 'New memory'} initial={editing} onClose={() => setEditing(null)}
          fields={[
            { k: 'title', label: 'Headline', required: true, placeholder: 'Best pasta of my life' },
            { row: [
              { k: 'date', label: 'Date', type: 'date', required: true, onChange: (v, set) => { set('date', v); set('cityId', cityFor(v)) } },
              { k: 'cityId', label: 'Where', empty: '🧳 Pre-trip', options: db.cities.map((c) => ({ v: c.id, l: `${c.flag} ${c.name}` })) },
            ] },
            { k: 'mood', label: 'Mood', render: (f, set) => <Seg small value={f.mood} onChange={(v) => set('mood', v)} options={MOODS} /> },
            { k: 'text', label: 'What happened?', type: 'textarea' },
            { k: 'photos', label: 'Photos', render: (f, set) => <Photos f={f} set={set} /> },
          ]}
          onSave={(f) => (editing.id ? update('memories', editing.id, f) : add('memories', f))}
          onDelete={editing.id && (() => remove('memories', editing.id))} />
      )}
    </div>
  )
}
