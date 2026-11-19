import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  supabase, loadCache, saveCache, fetchAll, fetchMembers, uploadAll, wipeRemote, subscribe,
  enqueue, flush, onPending, pendingOps, clearOutbox,
} from './backend'
import { toDb, applyOp } from './rows'
import { seed } from './seed'

const Ctx = createContext(null)
// crypto.randomUUID only exists on https/localhost; phones on a LAN dev server use plain http.
export const uid = () => crypto.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2)
const LOGGED = ['items', 'places', 'expenses', 'memories', 'docs', 'emergency', 'cities']
export const SAMPLE_COLS = ['items', 'places', 'expenses', 'memories', 'docs']
const label = (r) => r.title ?? r.name ?? r.label ?? r.text ?? ''
const ME_KEY = 'ps-europe-me'

export function StoreProvider({ children }) {
  const [db, setDb] = useState(() => loadCache() ?? seed())
  const [session, setSession] = useState(undefined) // undefined = still checking
  const [members, setMembers] = useState([])
  const [status, setStatus] = useState('loading')   // loading | synced | offline | not-member
  const [pending, setPending] = useState(0)
  const [meId, setMeId] = useState(() => localStorage.getItem(ME_KEY))

  useEffect(() => { saveCache(db) }, [db])
  useEffect(() => onPending(setPending), [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const email = session?.user?.email
  useEffect(() => {
    if (!email) return
    const load = async () => {
      try {
        const m = await fetchMembers()
        const mine = m.find((x) => x.email === email.toLowerCase())
        if (!mine) return setStatus('not-member')
        setMembers(m); setMeId(mine.crew_id); localStorage.setItem(ME_KEY, mine.crew_id)
        await flush()
        const rows = await fetchAll()
        let data
        if (!rows.length) {
          // First sign-in ever: start the shared trip from the demo data.
          data = seed()
          await uploadAll(data)
        } else {
          // Re-apply edits that haven't reached the server yet, so they don't flicker away.
          data = pendingOps().reduce(applyOp, toDb(rows))
        }
        // A member whose crew profile is missing (e.g. wiped by a reset) gets one back,
        // instead of silently being treated as the first crew member.
        if (!data.crew.some((u) => u.id === mine.crew_id)) {
          const row = { id: mine.crew_id, name: email.split('@')[0], emoji: '🌟', color: '#F7B9C8', role: 'Travel buddy' }
          data = applyOp(data, { col: 'crew', id: row.id, data: row })
          enqueue({ col: 'crew', id: row.id, data: row })
        }
        setDb(data)
        setStatus('synced')
      } catch { setStatus('offline') }
    }
    load()
    const ch = subscribe((op) => setDb((d) => applyOp(d, op)))
    const onOnline = () => load()
    window.addEventListener('online', onOnline)
    return () => { supabase.removeChannel(ch); window.removeEventListener('online', onOnline) }
  }, [email])

  // Route order always follows the dates, wherever cities are listed.
  const view = useMemo(() => ({ ...db, cities: [...db.cities].sort((a, b) => a.start.localeCompare(b.start)) }), [db])
  const me = db.crew.find((u) => u.id === meId) ?? db.crew[0]
  const stamp = () => ({ updatedBy: me.id, updatedAt: new Date().toISOString() })

  const commit = (col, row, action, del = false) => {
    const e = LOGGED.includes(col) && { id: uid(), userId: me.id, action, col, title: label(row), at: new Date().toISOString() }
    setDb((d) => {
      const next = applyOp(d, { col, id: row.id, data: row, del })
      return e ? applyOp(next, { col: 'log', id: e.id, data: e }) : next
    })
    enqueue(del ? { col, id: row.id, del: true } : { col, id: row.id, data: row })
    if (e) enqueue({ col: 'log', id: e.id, data: e })
  }

  const add = (col, item) => {
    const row = { ...item, id: uid(), createdBy: me.id, ...stamp() }
    commit(col, row, 'added')
    return row
  }
  const update = (col, id, patch) => commit(col, { ...db[col].find((r) => r.id === id), ...patch, ...stamp() }, 'updated')
  const remove = (col, id) => commit(col, db[col].find((r) => r.id === id) ?? { id }, 'removed', true)
  const setSingle = (col) => (patch) => {
    const data = { ...db[col], ...patch }
    setDb((d) => ({ ...d, [col]: data }))
    enqueue({ col, id: 'main', data })
  }

  const reset = async () => {
    // Keep the real crew (invited people included) — only the trip content goes back to the demo.
    const s = { ...seed(), crew: db.crew }
    try { clearOutbox(); await wipeRemote(); await uploadAll(s); setDb(s) }
    catch { alert('Reset needs an internet connection.') }
  }

  // Bulk delete without one activity-log line per row.
  const clearSample = () => {
    for (const c of SAMPLE_COLS) for (const r of db[c]) enqueue({ col: c, id: r.id, del: true })
    setDb((d) => ({ ...d, ...Object.fromEntries(SAMPLE_COLS.map((c) => [c, []])) }))
  }

  const invite = async (inviteEmail, name) => {
    const u = add('crew', { name, emoji: '🌟', color: '#F7B9C8', role: 'Travel buddy' })
    const { error } = await supabase.from('members').insert({ email: inviteEmail.trim().toLowerCase(), crew_id: u.id })
    if (error) return alert(error.message)
    setMembers(await fetchMembers())
  }

  const person = (id) => db.crew.find((u) => u.id === id)
  const city = (id) => db.cities.find((c) => c.id === id)

  return (
    <Ctx.Provider value={{
      db: view, me, add, update, remove, setTrip: setSingle('trip'), setSettings: setSingle('settings'), reset, clearSample,
      person, city, session, email, members, status, pending, invite, signOut: () => supabase.auth.signOut(),
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useStore = () => useContext(Ctx)
