// The only module that knows where data lives. Today: this device's localStorage.
// To go multi-user, swap load/save for Supabase queries + a realtime subscription (see supabase/schema.sql);
// the store's add/update/remove API stays the same, so pages don't change.
import { seed } from './seed'

const KEY = 'ps-europe-v1'

export const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? seed() } catch { return seed() }
}

let warned = false
export const save = (db) => {
  try { localStorage.setItem(KEY, JSON.stringify(db)) }
  catch {
    // shortcut: localStorage caps at ~5MB, so photos fill it fast; move photos to Supabase Storage when connecting a backend.
    if (!warned) alert('Storage is full — your latest change may not be saved. Try removing some photos.')
    warned = true
  }
}

export const clear = () => localStorage.removeItem(KEY)
