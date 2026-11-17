import { createContext, useContext, useEffect, useState } from 'react'
import { load, save, clear } from './backend'
import { seed } from './seed'

const Ctx = createContext(null)
// crypto.randomUUID only exists on https/localhost; phones on a LAN dev server use plain http.
const uid = () => crypto.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2)
const LOGGED = ['items', 'places', 'expenses', 'memories', 'docs', 'emergency']
const label = (r) => r.title ?? r.name ?? r.label ?? r.text ?? ''

export function StoreProvider({ children }) {
  const [db, setDb] = useState(load)
  useEffect(() => { save(db) }, [db])

  const me = db.crew.find((u) => u.id === db.settings.currentUser) ?? db.crew[0]
  const stamp = () => ({ updatedBy: me.id, updatedAt: new Date().toISOString() })
  const log = (d, action, col, row) => LOGGED.includes(col)
    ? [{ id: uid(), userId: me.id, action, col, title: label(row), at: new Date().toISOString() }, ...d.log].slice(0, 100)
    : d.log

  const add = (col, item) => {
    const row = { ...item, id: uid(), createdBy: me.id, ...stamp() }
    setDb((d) => ({ ...d, [col]: [...d[col], row], log: log(d, 'added', col, row) }))
    return row
  }
  const update = (col, id, patch) => setDb((d) => {
    const row = { ...d[col].find((r) => r.id === id), ...patch, ...stamp() }
    return { ...d, [col]: d[col].map((r) => (r.id === id ? row : r)), log: log(d, 'updated', col, row) }
  })
  const remove = (col, id) => setDb((d) => ({
    ...d, [col]: d[col].filter((r) => r.id !== id), log: log(d, 'removed', col, d[col].find((r) => r.id === id) ?? {}),
  }))
  const setTrip = (patch) => setDb((d) => ({ ...d, trip: { ...d.trip, ...patch } }))
  const setSettings = (patch) => setDb((d) => ({ ...d, settings: { ...d.settings, ...patch } }))
  const reset = () => { clear(); setDb(seed()) }

  const person = (id) => db.crew.find((u) => u.id === id)
  const city = (id) => db.cities.find((c) => c.id === id)

  return (
    <Ctx.Provider value={{ db, me, add, update, remove, setTrip, setSettings, reset, person, city }}>
      {children}
    </Ctx.Provider>
  )
}

export const useStore = () => useContext(Ctx)
