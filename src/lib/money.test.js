import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toHome, balances, settle, convert, shares, spending, settlementFor } from './money.js'

test('a settlement clears the debt but is not spending', () => {
  const ex = [{ amount: 100, currency: 'EUR', rate: 35.123, paidBy: 'a', split: ['a', 'b'] }]
  const [t] = settle(balances(ex, ['a', 'b']))
  const all = [...ex, settlementFor(t, '2026-12-10')]
  assert.deepEqual(settle(balances(all, ['a', 'b'])), [])
  assert.equal(spending(all).length, 1)
  assert.deepEqual(shares(spending(all), ['a', 'b']), shares(ex, ['a', 'b']))
})

test('converts to TWD with stored rate', () => {
  assert.equal(toHome({ amount: 10, currency: 'EUR', rate: 35 }), 350)
  assert.equal(toHome({ amount: 500, currency: 'TWD' }), 500)
})

test('balances and settle-up for a shared and a personal expense', () => {
  const ex = [
    { amount: 100, currency: 'EUR', rate: 35, paidBy: 'a', split: ['a', 'b'] }, // b owes a 1750
    { amount: 20, currency: 'EUR', rate: 35, paidBy: 'b', split: ['b'] },       // personal, no debt
    { amount: 700, currency: 'TWD', paidBy: 'b', split: ['a', 'b'] },          // a owes b 350
  ]
  const net = balances(ex, ['a', 'b'])
  assert.equal(net.a, 1400)
  assert.equal(net.b, -1400)
  assert.deepEqual(settle(net), [{ from: 'b', to: 'a', amount: 1400 }])
  assert.deepEqual(shares(ex, ['a', 'b']), { a: 2100, b: 2800 })
})

test('converts between currencies via TWD, null when a rate is missing', () => {
  assert.equal(convert(10, 'EUR', 'CHF', { EUR: 35, CHF: 70 }), 5)
  assert.equal(convert(10, 'EUR', 'GBP', { EUR: 35 }), null)
})
