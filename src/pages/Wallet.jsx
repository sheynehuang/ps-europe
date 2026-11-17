import { useState } from 'react'
import { Phone, ShieldAlert } from 'lucide-react'
import { useStore } from '../data/store'
import { ITEM_TYPES, DOC_KINDS } from '../lib/meta'
import { fmt, byDateTime } from '../lib/dates'
import ItemSheet from '../components/ItemSheet'
import { PageHeader, Seg, Fab, FormSheet, Who } from '../components/ui'

const GROUPS = [['flight', 'Flights'], ['train', 'Trains'], ['hotel', 'Stays'], ['reservation', 'Reservations']]

function Ticket({ item, onClick }) {
  const t = ITEM_TYPES[item.type]
  const { city } = useStore()
  return (
    <button className={`ticket ${t.tone}`} onClick={onClick}>
      <div className="ticket-main">
        <span className="ticket-kind">{t.emoji} {t.label} · {fmt(item.date)}{item.time && ` · ${item.time}`}</span>
        {item.from ? (
          <span className="ticket-route"><b>{item.from}</b><span className="dash">{item.type === 'train' ? '🚆' : '✈️'}</span><b>{item.to}</b></span>
        ) : <b className="ticket-title">{item.title}</b>}
        <span className="muted">{item.from ? item.title : item.location || city(item.cityId)?.name}</span>
      </div>
      <div className="ticket-stub">
        <span>{item.number ? 'No.' : 'Ref'}</span>
        <b>{item.number || item.ref || '—'}</b>
        {item.number && item.ref && <small>#{item.ref}</small>}
      </div>
    </button>
  )
}

export default function Wallet() {
  const { db, add, update, remove } = useStore()
  const [tab, setTab] = useState('bookings')
  const [editItem, setEditItem] = useState(null)
  const [editDoc, setEditDoc] = useState(null)
  const [editSos, setEditSos] = useState(null)
  const sorted = [...db.items].sort(byDateTime)

  return (
    <div className="page">
      <PageHeader back kicker="all in one pocket" title="Travel Wallet" />
      <Seg value={tab} onChange={setTab} options={[{ v: 'bookings', l: '🎫 Bookings' }, { v: 'docs', l: '🛂 Documents' }, { v: 'sos', l: '🆘 Emergency' }]} />

      {tab === 'bookings' && GROUPS.map(([type, label]) => {
        const list = sorted.filter((i) => i.type === type)
        return list.length > 0 && (
          <section key={type}>
            <div className="section-head"><h2>{label}</h2><span className="muted">{list.length}</span></div>
            <div className="stack">{list.map((i) => <Ticket key={i.id} item={i} onClick={() => setEditItem(i)} />)}</div>
          </section>
        )
      })}

      {tab === 'docs' && (
        <>
          <div className="notice"><ShieldAlert size={18} /> Saved on this device only. Keep full passport numbers out until login is connected.</div>
          <div className="stack">
            {db.docs.map((d) => (
              <button key={d.id} className="doc-card" onClick={() => setEditDoc(d)}>
                <span className="doc-kind">{DOC_KINDS[d.kind]}</span>
                <b>{d.title}</b>
                {d.detail && <span>{d.detail}</span>}
                {d.notes && <span className="muted">{d.notes}</span>}
                <Who row={d} />
              </button>
            ))}
          </div>
        </>
      )}

      {tab === 'sos' && (
        <div className="stack">
          {db.emergency.map((x) => (
            <div key={x.id} className="sos-card">
              <button className="grow sos-body" onClick={() => setEditSos(x)}>
                <span className="muted">{x.label}</span>
                <b>{x.value || 'Tap to add'}</b>
                {x.notes && <small className="muted">{x.notes}</small>}
              </button>
              {/^[+\d][\d\s-]{1,}$/.test(x.value) && <a className="call" href={`tel:${x.value.replace(/[\s-]/g, '')}`} aria-label={`Call ${x.label}`}><Phone size={20} /></a>}
            </div>
          ))}
        </div>
      )}

      <Fab label="Add" onClick={() => (tab === 'bookings' ? setEditItem({ type: 'flight' }) : tab === 'docs' ? setEditDoc({}) : setEditSos({}))} />
      {editItem && <ItemSheet item={editItem} onClose={() => setEditItem(null)} />}
      {editDoc && (
        <FormSheet title={editDoc.id ? 'Edit document' : 'Add document'} initial={{ kind: 'other', ...editDoc }} onClose={() => setEditDoc(null)}
          fields={[
            { k: 'kind', label: 'Type', options: DOC_KINDS },
            { k: 'title', label: 'Title', required: true },
            { k: 'detail', label: 'Key details', placeholder: 'Expiry, policy no., last 4 digits…' },
            { k: 'notes', label: 'Notes', type: 'textarea' },
          ]}
          onSave={(f) => (editDoc.id ? update('docs', editDoc.id, f) : add('docs', f))}
          onDelete={editDoc.id && (() => remove('docs', editDoc.id))} />
      )}
      {editSos && (
        <FormSheet title={editSos.id ? 'Edit emergency info' : 'Add emergency info'} initial={editSos} onClose={() => setEditSos(null)}
          fields={[
            { k: 'label', label: 'Label', required: true, placeholder: 'Hotel front desk' },
            { k: 'value', label: 'Number or info', placeholder: '+39 06 …' },
            { k: 'notes', label: 'Notes', type: 'textarea' },
          ]}
          onSave={(f) => (editSos.id ? update('emergency', editSos.id, f) : add('emergency', f))}
          onDelete={editSos.id && (() => remove('emergency', editSos.id))} />
      )}
    </div>
  )
}
