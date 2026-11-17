// Pure conversions between the app's db object and Supabase `rows` (col, id, data).
import { seed } from './seed.js'

export const SINGLE = ['trip', 'settings'] // stored as one row with id 'main'; everything else is an array

const emptyDb = () => Object.fromEntries(Object.entries(seed()).map(([k, v]) => [k, Array.isArray(v) ? [] : v]))
const sortLog = (db) => ({ ...db, log: [...db.log].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 100) })

export const toDb = (rows) => {
  const db = emptyDb()
  for (const r of rows) SINGLE.includes(r.col) ? (db[r.col] = r.data) : (db[r.col] ||= []).push(r.data)
  return sortLog(db)
}

export const toRows = (db) => Object.entries(db).flatMap(([col, v]) =>
  SINGLE.includes(col) ? [{ col, id: 'main', data: v }] : v.map((d) => ({ col, id: d.id, data: d })))

// Applies one change (from realtime or the outbox) to the in-memory db.
export const applyOp = (db, { col, id, data, del }) => {
  if (SINGLE.includes(col)) return del ? db : { ...db, [col]: data }
  const list = db[col] || []
  const next = { ...db, [col]: del ? list.filter((r) => r.id !== id) : list.some((r) => r.id === id) ? list.map((r) => (r.id === id ? data : r)) : [...list, data] }
  return col === 'log' ? sortLog(next) : next
}
