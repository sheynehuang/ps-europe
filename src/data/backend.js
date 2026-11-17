// The only module that knows where data lives: Supabase (one `rows` table, see supabase/schema.sql)
// plus a localStorage cache + outbox so the app opens and edits work offline.
import { createClient } from '@supabase/supabase-js'
import { toRows } from './rows'

// Publishable key is meant to ship to browsers; row-level security policies protect the data.
export const supabase = createClient('https://yvxneiuywsyscanvrtsm.supabase.co', 'sb_publishable_Q7zkBcB5rCiZ0xROvNyz-A_EGEbocH4')

const CACHE = 'ps-europe-v1'
const OUTBOX = 'ps-europe-outbox'

// ---- local cache ----
export const loadCache = () => { try { return JSON.parse(localStorage.getItem(CACHE)) } catch { return null } }
let warned = false
export const saveCache = (db) => {
  try { localStorage.setItem(CACHE, JSON.stringify(db)) }
  catch { if (!warned) alert('Phone storage is full — some offline data may not be cached.'); warned = true }
}

// ---- remote ----
export async function fetchAll() {
  const out = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from('rows').select('col,id,data').range(from, from + 999)
    if (error) throw error
    out.push(...data)
    if (data.length < 1000) return out
  }
}

export async function fetchMembers() {
  const { data, error } = await supabase.from('members').select('email,crew_id')
  if (error) throw error
  return data
}

export async function uploadAll(db) {
  const { error } = await supabase.from('rows').upsert(toRows(db))
  if (error) throw error
}

export async function wipeRemote() {
  const { error } = await supabase.from('rows').delete().neq('col', '')
  if (error) throw error
}

export const subscribe = (onOp) => supabase.channel('rows')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'rows' }, (p) => {
    const r = p.eventType === 'DELETE' ? p.old : p.new
    onOp({ col: r.col, id: r.id, data: r.data, del: p.eventType === 'DELETE' })
  })
  .subscribe()

// ---- outbox: every edit is queued here first, so nothing is lost while offline ----
let outbox = (() => { try { return JSON.parse(localStorage.getItem(OUTBOX)) || [] } catch { return [] } })()
const persist = () => localStorage.setItem(OUTBOX, JSON.stringify(outbox))
const listeners = new Set()
const notify = () => listeners.forEach((f) => f(outbox.length))
export const onPending = (f) => { listeners.add(f); f(outbox.length); return () => listeners.delete(f) }
export const pendingOps = () => outbox

export const enqueue = (op) => { outbox.push(op); persist(); notify(); flush() }
export const clearOutbox = () => { outbox = []; persist(); notify() }

let flushing = false
export async function flush() {
  if (flushing) return
  flushing = true
  try {
    while (outbox.length) {
      const op = outbox[0]
      const { error } = op.del
        ? await supabase.from('rows').delete().match({ col: op.col, id: op.id })
        : await supabase.from('rows').upsert({ col: op.col, id: op.id, data: op.data, updated_at: new Date().toISOString() })
      if (error) break // offline or not signed in yet — retry later
      outbox.shift(); persist(); notify()
    }
  } catch { /* network down — retry later */ }
  finally { flushing = false }
}
window.addEventListener('online', flush)

export async function uploadPhoto(dataUrl, name) {
  try {
    const blob = await (await fetch(dataUrl)).blob()
    const path = `${name}.jpg`
    const { error } = await supabase.storage.from('photos').upload(path, blob, { contentType: 'image/jpeg' })
    if (error) throw error
    return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl
  } catch {
    return dataUrl // shortcut: offline photos stay embedded in the memory row; re-add later to move them to Storage
  }
}
