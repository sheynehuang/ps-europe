import { MapPin } from 'lucide-react'
import { ITEM_TYPES } from '../lib/meta'
import { fmtMoney } from '../lib/money'
import { fmt } from '../lib/dates'
import { Who } from './ui'

export default function ItemCard({ item, onClick, showDate }) {
  const t = ITEM_TYPES[item.type] ?? ITEM_TYPES.activity
  const Icon = t.icon
  return (
    <button className="item-card" onClick={onClick}>
      <span className={`ibubble ${t.tone}`}><Icon size={20} /></span>
      <span className="item-body">
        <span className="item-top">
          {showDate && <b>{fmt(item.date)}</b>}
          {item.time && <span>{item.time}</span>}
          <span className="item-type">{t.label}</span>
        </span>
        <span className="item-title">{item.title}</span>
        {(item.from || item.number) && <span className="item-sub">{[item.number, item.from && `${item.from} → ${item.to}`].filter(Boolean).join(' · ')}</span>}
        {item.location && <span className="item-sub"><MapPin size={12} /> {item.location}</span>}
        <span className="item-foot">
          <Who row={item} />
          {item.ref && <span className="ref">#{item.ref}</span>}
          {item.cost > 0 && <span className="cost">{fmtMoney(item.cost, item.currency)}</span>}
        </span>
      </span>
    </button>
  )
}
