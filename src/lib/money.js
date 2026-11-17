// e.rate = how many TWD one unit of e.currency was worth when the expense was recorded.
export const toHome = (e) => (Number(e.amount) || 0) * (e.currency === 'TWD' ? 1 : Number(e.rate) || 0)

export function sumBy(expenses, key) {
  const out = {}
  for (const e of expenses) out[e[key] ?? 'none'] = (out[e[key] ?? 'none'] || 0) + toHome(e)
  return out
}

// net > 0: the group owes this person; net < 0: this person owes the group.
export function balances(expenses, ids) {
  const net = Object.fromEntries(ids.map((i) => [i, 0]))
  for (const e of expenses) {
    if (!e.split?.length) continue
    const v = toHome(e)
    net[e.paidBy] = (net[e.paidBy] || 0) + v
    for (const u of e.split) net[u] = (net[u] || 0) - v / e.split.length
  }
  return net
}

// Each person's own share of spending (what they actually consumed).
export function shares(expenses, ids) {
  const out = Object.fromEntries(ids.map((i) => [i, 0]))
  for (const e of expenses) for (const u of e.split || []) out[u] = (out[u] || 0) + toHome(e) / e.split.length
  return out
}

// Greedy settle-up: fewest transfers for small groups.
export function settle(net) {
  const debt = Object.entries(net).filter(([, v]) => v < -0.5).map(([id, v]) => ({ id, v: -v }))
  const cred = Object.entries(net).filter(([, v]) => v > 0.5).map(([id, v]) => ({ id, v }))
  const out = []
  let i = 0, j = 0
  while (i < debt.length && j < cred.length) {
    const x = Math.min(debt[i].v, cred[j].v)
    out.push({ from: debt[i].id, to: cred[j].id, amount: x })
    debt[i].v -= x; cred[j].v -= x
    if (debt[i].v < 0.5) i++
    if (cred[j].v < 0.5) j++
  }
  return out
}

// rates: { CODE: TWD per unit }
export const convert = (amount, from, to, rates) => {
  const r = { ...rates, TWD: 1 }
  if (!r[from] || !r[to]) return null
  return (amount * r[from]) / r[to]
}

export const fmtTWD = (n) => 'NT$ ' + Math.round(n).toLocaleString('en-US')
export const fmtMoney = (n, c) => {
  try { return new Intl.NumberFormat('en-GB', { style: 'currency', currency: c, maximumFractionDigits: c === 'TWD' ? 0 : 2 }).format(n) }
  catch { return `${n} ${c}` }
}
