const LIST = 'AL Albania|AD Andorra|AT Austria|BE Belgium|BA Bosnia and Herzegovina|BG Bulgaria|HR Croatia|CY Cyprus|CZ Czechia|DK Denmark|EE Estonia|FI Finland|FR France|DE Germany|GR Greece|HU Hungary|IS Iceland|IE Ireland|IT Italy|LV Latvia|LI Liechtenstein|LT Lithuania|LU Luxembourg|MT Malta|MC Monaco|ME Montenegro|NL Netherlands|MK North Macedonia|NO Norway|PL Poland|PT Portugal|RO Romania|SM San Marino|RS Serbia|SK Slovakia|SI Slovenia|ES Spain|SE Sweden|CH Switzerland|TR Türkiye|GB United Kingdom|VA Vatican City'

export const COUNTRIES = LIST.split('|').map((s) => ({ code: s.slice(0, 2), name: s.slice(3) }))
export const codeOf = (name) => COUNTRIES.find((c) => c.name === name)?.code
// Flag emoji = the two letters of the ISO code as "regional indicator" symbols.
export const flagOf = (code) => (code ? String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)) : '📍')

// Free OpenStreetMap geocoder (fair use: occasional lookups only, never in a loop).
export async function geocode(city, country) {
  const q = new URLSearchParams({ q: city, format: 'json', limit: '1' })
  const code = codeOf(country)
  if (code) q.set('countrycodes', code.toLowerCase())
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${q}`)
  const [hit] = await res.json()
  return hit ? { lat: +(+hit.lat).toFixed(4), lng: +(+hit.lon).toFixed(4) } : null
}
