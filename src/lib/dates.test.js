import { test } from 'node:test'
import assert from 'node:assert/strict'
import { addDays, daysBetween } from './dates.js'

test('addDays crosses month and year boundaries', () => {
  assert.equal(addDays('2026-12-30', 3), '2027-01-02')
  assert.equal(addDays('2026-12-01', -1), '2026-11-30')
  assert.equal(daysBetween('2026-12-09', addDays('2026-12-09', 5)), 5)
})
