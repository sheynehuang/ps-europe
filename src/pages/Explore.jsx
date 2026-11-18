import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Check, CalendarPlus } from 'lucide-react'
import { useStore } from '../data/store'
import { PLACE_CATS } from '../lib/meta'
import { fmt } from '../lib/dates'
import ItemSheet from '../components/ItemSheet'
import { PageHeader, Fab, FormSheet, Empty, Who } from '../components/ui'

const pin = (html, bg, cls = '') => L.divIcon({ className: '', html: `<div class="pin ${cls}" style="background:${bg}"><span>${html}</span></div>`, iconSize: [34, 34], iconAnchor: [17, 34], popupAnchor: [0, -30] })

function FlyTo({ target }) {
  const map = useMap()
  useEffect(() => { map.flyTo([target.lat, target.lng], target.zoom, { duration: 0.8 }) }, [target.lat, target.lng, target.zoom, map])
  return null
}
function ClickToAdd({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng) })
  return null
}

export function PlaceSheet({ place, onClose }) {
  const { db, add, update, remove } = useStore()
  return (
    <FormSheet
      title={place.id ? 'Edit place' : 'Save a place'}
      initial={{ category: 'restaurant', visited: false, ...place }}
      fields={[
        { k: 'name', label: 'Name', required: true, placeholder: 'That cute bakery' },
        { row: [
          { k: 'category', label: 'Category', options: PLACE_CATS },
          { k: 'cityId', label: 'City', options: db.cities.map((c) => ({ v: c.id, l: `${c.flag} ${c.name}` })) },
        ] },
        { k: 'notes', label: 'Notes', type: 'textarea', placeholder: 'What to order, opening hours…' },
        { row: [{ k: 'lat', label: 'Latitude', type: 'number', required: true }, { k: 'lng', label: 'Longitude', type: 'number', required: true }] },
      ]}
      onSave={(f) => (place.id ? update('places', place.id, f) : add('places', f))}
      onDelete={place.id && (() => remove('places', place.id))}
      onClose={onClose}
    />
  )
}

export default function Explore() {
  const { db, update, city } = useStore()
  const [cat, setCat] = useState('all')
  const [cityId, setCityId] = useState('all')
  const [hideVisited, setHideVisited] = useState(false)
  const [placeEdit, setPlaceEdit] = useState(null)
  const [planEdit, setPlanEdit] = useState(null)

  const c = city(cityId)
  const target = c?.lat ? { lat: c.lat, lng: c.lng, zoom: 13 } : { lat: 44.5, lng: 4, zoom: 4 }
  const places = db.places.filter((p) => (cat === 'all' || p.category === cat) && (cityId === 'all' || p.cityId === cityId) && !(hideVisited && p.visited))
  const toggle = (p) => update('places', p.id, { visited: !p.visited })
  const toPlan = (p) => setPlanEdit({ type: 'activity', title: p.name, placeId: p.id, cityId: p.cityId, location: p.name, date: city(p.cityId)?.start })
  const linked = (p) => db.items.filter((i) => i.placeId === p.id)

  return (
    <div className="page">
      <PageHeader kicker="pins & wishlists" title="Explore" />

      <div className="hscroll pills">
        <button className={`pill ${cityId === 'all' ? 'on' : ''}`} onClick={() => setCityId('all')}>🌍 Europe</button>
        {db.cities.map((x) => <button key={x.id} className={`pill ${cityId === x.id ? 'on' : ''}`} onClick={() => setCityId(x.id)}>{x.flag} {x.name}</button>)}
      </div>

      <div className="map-wrap">
        <MapContainer center={[44.5, 4]} zoom={4} scrollWheelZoom={false} className="map">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FlyTo target={target} />
          <ClickToAdd onPick={(ll) => setPlaceEdit({ lat: +ll.lat.toFixed(5), lng: +ll.lng.toFixed(5), cityId: cityId === 'all' ? db.cities[0]?.id ?? '' : cityId })} />
          <Polyline positions={db.cities.filter((x) => x.lat).map((x) => [x.lat, x.lng])} pathOptions={{ color: '#E07B45', weight: 3, dashArray: '6 8' }} />
          {cityId === 'all' && db.cities.map((x, i) => x.lat && (
            <Marker key={x.id} position={[x.lat, x.lng]} icon={pin(i + 1, '#3B2418', 'city')} eventHandlers={{ click: () => setCityId(x.id) }} />
          ))}
          {cityId !== 'all' && places.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={pin(PLACE_CATS[p.category].emoji, PLACE_CATS[p.category].color, p.visited ? 'visited' : '')}>
              <Popup>
                <b>{p.name}</b><br />{PLACE_CATS[p.category].label}{p.visited && ' · visited ✓'}<br />
                <button className="link" onClick={() => toPlan(p)}>+ Add to plan</button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        <p className="map-tip">Tip: tap the map to drop a new pin</p>
      </div>

      <div className="hscroll pills">
        <button className={`pill ${cat === 'all' ? 'on' : ''}`} onClick={() => setCat('all')}>All</button>
        {Object.entries(PLACE_CATS).map(([k, v]) => <button key={k} className={`pill ${cat === k ? 'on' : ''}`} onClick={() => setCat(k)}>{v.emoji} {v.label}</button>)}
      </div>
      <label className="toggle-row"><input type="checkbox" checked={hideVisited} onChange={(e) => setHideVisited(e.target.checked)} /> Hide visited</label>

      <div className="stack">
        {!places.length && <Empty emoji="🧭" title="No places here yet" text="Tap the map or the + button to save one." />}
        {places.map((p) => {
          const l = linked(p)
          return (
            <div key={p.id} className={`place-card ${p.visited ? 'done' : ''}`}>
              <span className="pbubble" style={{ background: PLACE_CATS[p.category].color }}>{PLACE_CATS[p.category].emoji}</span>
              <button className="place-body" onClick={() => setPlaceEdit(p)}>
                <b>{p.name}</b>
                <span className="muted">{city(p.cityId)?.flag} {city(p.cityId)?.name} · {PLACE_CATS[p.category].label}</span>
                {p.notes && <span className="note">{p.notes}</span>}
                {l.length > 0 && <span className="linked">📅 In plan: {l.map((i) => fmt(i.date)).join(', ')}</span>}
                <Who row={p} />
              </button>
              <div className="place-actions">
                <button className={`check ${p.visited ? 'on' : ''}`} onClick={() => toggle(p)} aria-label={p.visited ? 'Mark not visited' : 'Mark visited'}><Check size={18} /></button>
                <button className="icon-btn sm" onClick={() => toPlan(p)} aria-label="Add to plan"><CalendarPlus size={17} /></button>
              </div>
            </div>
          )
        })}
      </div>

      <Fab label="Save a place" onClick={() => { const x = c ?? db.cities[0] ?? { id: '', lat: 48.8566, lng: 2.3522 }; setPlaceEdit({ cityId: x.id, lat: x.lat, lng: x.lng }) }} />
      {placeEdit && <PlaceSheet place={placeEdit} onClose={() => setPlaceEdit(null)} />}
      {planEdit && <ItemSheet item={planEdit} onClose={() => setPlanEdit(null)} />}
    </div>
  )
}
