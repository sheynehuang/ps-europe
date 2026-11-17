import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Plus, ChevronLeft } from 'lucide-react'
import { useStore } from '../data/store'

export function Sheet({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />
        <div className="sheet-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

const toOptions = (opts) => (Array.isArray(opts) ? opts : Object.entries(opts)).map((o) =>
  typeof o === 'string' ? { v: o, l: o } : Array.isArray(o) ? { v: o[0], l: typeof o[1] === 'string' ? o[1] : `${o[1].emoji ?? ''} ${o[1].label ?? o[1].name}` } : o)

function FieldInput({ fd, f, set }) {
  if (fd.row) return <div className="field-row">{fd.row.filter(Boolean).map((x) => <FieldInput key={x.k} fd={x} f={f} set={set} />)}</div>
  const value = f[fd.k] ?? ''
  const change = (v) => (fd.onChange ? fd.onChange(v, set, f) : set(fd.k, v))
  if (fd.render) return <div className="field"><span>{fd.label}</span>{fd.render(f, set)}</div>
  let input
  if (fd.type === 'textarea') input = <textarea rows={3} value={value} placeholder={fd.placeholder} onChange={(e) => change(e.target.value)} />
  else if (fd.options) input = (
    <select value={value} required={fd.required} onChange={(e) => change(e.target.value)}>
      {fd.empty !== undefined && <option value="">{fd.empty}</option>}
      {toOptions(fd.options).map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  )
  else input = (
    <input type={fd.type || 'text'} value={value} required={fd.required} placeholder={fd.placeholder}
      step={fd.type === 'number' ? 'any' : undefined} min={fd.min} inputMode={fd.type === 'number' ? 'decimal' : undefined}
      onChange={(e) => change(fd.type === 'number' && e.target.value !== '' ? Number(e.target.value) : e.target.value)} />
  )
  return <label className="field" style={fd.grow ? { flex: fd.grow } : undefined}><span>{fd.label}</span>{input}{fd.hint && <small>{fd.hint}</small>}</label>
}

// Config-driven form in a bottom sheet. `fields` may be a function of current values for conditional fields.
export function FormSheet({ title, initial, fields, onSave, onDelete, onClose, saveLabel = 'Save', footer }) {
  const [f, setF] = useState(initial)
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))
  const list = (typeof fields === 'function' ? fields(f, set) : fields).filter(Boolean)
  const submit = (e) => { e.preventDefault(); onSave(f); onClose() }
  return (
    <Sheet title={title} onClose={onClose}>
      <form className="form" onSubmit={submit}>
        {list.map((fd, i) => <FieldInput key={fd.k ?? i} fd={fd} f={f} set={set} />)}
        {footer?.(f)}
        <div className="form-actions">
          {onDelete && <button type="button" className="btn ghost danger" onClick={() => { if (confirm('Delete this?')) { onDelete(); onClose() } }}>Delete</button>}
          <button className="btn primary">{saveLabel}</button>
        </div>
      </form>
    </Sheet>
  )
}

export function Seg({ value, onChange, options, small }) {
  return (
    <div className={`seg ${small ? 'small' : ''}`} role="tablist">
      {toOptions(options).map((o) => (
        <button type="button" role="tab" aria-selected={value === o.v} key={o.v} className={value === o.v ? 'on' : ''} onClick={() => onChange(o.v)}>{o.l}</button>
      ))}
    </div>
  )
}

export function Avatar({ id, size = 26 }) {
  const { person } = useStore()
  const u = person(id)
  if (!u) return null
  return <span className="avatar" title={u.name} style={{ width: size, height: size, fontSize: size * 0.55, background: u.color }}>{u.emoji}</span>
}

export function Who({ row }) {
  const { person } = useStore()
  if (!row.updatedBy) return null
  const edited = row.updatedBy !== row.createdBy
  return (
    <span className="who">
      <Avatar id={row.createdBy} size={18} />
      {edited && <Avatar id={row.updatedBy} size={18} />}
      {edited ? `edited by ${person(row.updatedBy)?.name}` : `added by ${person(row.createdBy)?.name}`}
    </span>
  )
}

export function PageHeader({ kicker, title, back, right }) {
  const nav = useNavigate()
  return (
    <header className="page-head">
      {back && <button className="icon-btn back" onClick={() => nav(-1)} aria-label="Back"><ChevronLeft size={22} /></button>}
      <div className="grow">
        {kicker && <div className="script kicker">{kicker}</div>}
        <h1 className="display">{title}</h1>
      </div>
      {right}
    </header>
  )
}

export const Fab = ({ onClick, label = 'Add' }) => (
  <button className="fab" onClick={onClick} aria-label={label}><Plus size={26} strokeWidth={2.6} /></button>
)

export const Empty = ({ emoji, title, text, action }) => (
  <div className="empty"><div className="empty-emoji">{emoji}</div><h3>{title}</h3>{text && <p>{text}</p>}{action}</div>
)

export const Chip = ({ tone = 'peach', children, ...p }) => <span className={`chip ${tone}`} {...p}>{children}</span>
