export const CURRENCIES = ['EUR', 'CHF', 'TWD', 'GBP', 'USD']

// Real rates from a free, keyless public API. Returns TWD per 1 unit of each currency.
export async function fetchRates() {
  const res = await fetch('https://open.er-api.com/v6/latest/TWD')
  const j = await res.json()
  if (j.result !== 'success') throw new Error('Rate service unavailable')
  const rates = {}
  for (const c of CURRENCIES) if (c !== 'TWD' && j.rates[c]) rates[c] = +(1 / j.rates[c]).toFixed(4)
  return { rates, ratesDate: j.time_last_update_utc, ratesSource: 'open.er-api.com' }
}
