import { useStore } from '../data/store'
import { ITEM_TYPES, BOOKING_TYPES } from '../lib/meta'
import { CURRENCIES } from '../lib/rates'
import { FormSheet } from './ui'

// Add/edit any itinerary entry: activity, flight, train, stay or reservation.
export default function ItemSheet({ item, onClose }) {
  const { db, add, update, remove } = useStore()
  const cityFor = (date) => db.cities.find((c) => date >= c.start && date < c.end)?.id ?? db.cities.at(-1).id
  const initial = { type: 'activity', date: db.trip.start, currency: 'EUR', ...item }
  initial.cityId ||= cityFor(initial.date)

  const fields = (f) => {
    const travel = f.type === 'flight' || f.type === 'train'
    return [
      { k: 'type', label: 'Type', render: (f, set) => (
        <div className="type-pick">
          {Object.entries(ITEM_TYPES).map(([k, t]) => (
            <button type="button" key={k} className={`chip ${t.tone} ${f.type === k ? 'on' : ''}`} onClick={() => set('type', k)}>{t.emoji} {t.label}</button>
          ))}
        </div>
      ) },
      { k: 'title', label: 'Title', required: true, placeholder: travel ? 'Paris → Lucerne' : 'What are we doing?' },
      { row: [
        { k: 'date', label: 'Date', type: 'date', required: true, onChange: (v, set) => { set('date', v); if (v) set('cityId', cityFor(v)) } },
        { k: 'time', label: f.type === 'hotel' ? 'Check-in' : 'Time', type: 'time' },
      ] },
      { k: 'cityId', label: 'City', options: db.cities.map((c) => ({ v: c.id, l: `${c.flag} ${c.name}` })) },
      travel && { row: [{ k: 'from', label: 'From' }, { k: 'to', label: 'To' }] },
      travel && { k: 'number', label: f.type === 'flight' ? 'Flight number' : 'Train number', placeholder: f.type === 'flight' ? 'BR87' : 'TGV 9213' },
      BOOKING_TYPES.includes(f.type) && { k: 'ref', label: 'Confirmation code' },
      { k: 'location', label: 'Location / address' },
      { k: 'placeId', label: 'Linked saved place', empty: '— none —',
        options: db.places.filter((p) => p.cityId === f.cityId).map((p) => ({ v: p.id, l: p.name })),
        onChange: (v, set, f) => { set('placeId', v); if (v && !f.location) set('location', db.places.find((p) => p.id === v)?.name) } },
      { row: [
        { k: 'cost', label: 'Estimated cost', type: 'number', min: 0, grow: 2 },
        { k: 'currency', label: 'Currency', options: CURRENCIES },
      ] },
      { k: 'notes', label: 'Notes', type: 'textarea' },
    ]
  }

  const save = (f) => {
    const row = { ...f, cost: Number(f.cost) || 0 }
    item.id ? update('items', item.id, row) : add('items', row)
  }

  return (
    <FormSheet
      title={item.id ? 'Edit plan' : 'Add to plan'}
      initial={initial}
      fields={fields}
      onSave={save}
      onDelete={item.id && (() => remove('items', item.id))}
      onClose={onClose}
    />
  )
}
