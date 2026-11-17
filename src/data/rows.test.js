import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toDb, toRows, applyOp } from './rows.js'
import { seed } from './seed.js'

test('db -> rows -> db round-trips the seed', () => {
  const s = seed()
  assert.deepEqual(toDb(toRows(s)), { ...s, log: [...s.log].sort((a, b) => b.at.localeCompare(a.at)) })
})

test('applyOp inserts, updates, deletes and replaces singles', () => {
  let db = toDb([])
  db = applyOp(db, { col: 'items', id: 'a', data: { id: 'a', title: 'x' } })
  db = applyOp(db, { col: 'items', id: 'a', data: { id: 'a', title: 'y' } })
  assert.deepEqual(db.items, [{ id: 'a', title: 'y' }])
  db = applyOp(db, { col: 'items', id: 'a', del: true })
  assert.deepEqual(db.items, [])
  db = applyOp(db, { col: 'trip', id: 'main', data: { name: 'T' } })
  assert.equal(db.trip.name, 'T')
})
