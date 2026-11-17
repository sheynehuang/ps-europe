// All trip dates are plain 'YYYY-MM-DD' strings in local time, so string comparison == date comparison.
export const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const today = () => iso(new Date())
export const daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / 864e5)
export const eachDay = (a, b) => {
  const out = []
  for (const d = parse(a); iso(d) <= b; d.setDate(d.getDate() + 1)) out.push(iso(d))
  return out
}
export const fmt = (s, o = { weekday: 'short', day: 'numeric', month: 'short' }) => parse(s).toLocaleDateString('en-GB', o)
export const fmtShort = (s) => fmt(s, { day: 'numeric', month: 'short' })
export const byDateTime = (a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || ''))
export const ago = (isoTime) => {
  const m = Math.round((Date.now() - new Date(isoTime)) / 6e4)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  if (m < 1440) return `${Math.round(m / 60)}h ago`
  return `${Math.round(m / 1440)}d ago`
}
