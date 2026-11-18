import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Pencil, ArrowRight } from 'lucide-react'
import { useStore } from '../data/store'
import { EXPENSE_CATS } from '../lib/meta'
import { CURRENCIES } from '../lib/rates'
import { toHome, sumBy, balances, shares, settle, fmtTWD, fmtMoney } from '../lib/money'
import { fmt, today } from '../lib/dates'
import { PageHeader, Fab, FormSheet, Seg, Avatar, Who, Empty } from '../components/ui'

function Donut({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const C = 2 * Math.PI * 42
  let off = 0
  return (
    <svg viewBox="0 0 100 100" className="donut" role="img" aria-label="Spending by category">
      <circle cx="50" cy="50" r="42" fill="none" stroke="#F3E9DC" strokeWidth="14" />
      {data.map((d) => {
        const len = (d.value / total) * C
        const el = <circle key={d.key} cx="50" cy="50" r="42" fill="none" stroke={d.color} strokeWidth="14"
          strokeDasharray={`${Math.max(len - 1.2, 0)} ${C}`} strokeDashoffset={-off} transform="rotate(-90 50 50)" />
        off += len
        return el
      })}
    </svg>
  )
}

function ExpenseSheet({ expense, onClose }) {
  const { db, me, add, update, remove } = useStore()
  const rates = db.settings.rates
  const initial = { currency: 'EUR', category: 'food', date: today(), paidBy: me.id, split: db.crew.map((u) => u.id), cityId: '', ...expense }
  initial.rate ??= initial.currency === 'TWD' ? 1 : rates[initial.currency] ?? ''

  return (
    <FormSheet
      title={expense.id ? 'Edit expense' : 'New expense'}
      initial={initial}
      fields={(f) => [
        { k: 'title', label: 'What for?', required: true, placeholder: 'Gelato x2 🍦' },
        { row: [
          { k: 'amount', label: 'Amount', type: 'number', required: true, min: 0, grow: 2 },
          { k: 'currency', label: 'Currency', options: CURRENCIES, onChange: (v, set) => { set('currency', v); set('rate', v === 'TWD' ? 1 : rates[v] ?? '') } },
        ] },
        f.currency !== 'TWD' && { k: 'rate', label: `Rate: 1 ${f.currency} = ? TWD`, type: 'number', required: true, min: 0.0001,
          hint: rates[f.currency] ? `Saved rate from ${db.settings.ratesSource}` : 'No saved rate — enter today’s rate, or fetch rates in Tools → Converter' },
        { k: 'category', label: 'Category', render: (f, set) => (
          <div className="type-pick">{Object.entries(EXPENSE_CATS).map(([k, c]) => (
            <button type="button" key={k} className={`chip cream ${f.category === k ? 'on' : ''}`} onClick={() => set('category', k)}>{c.emoji} {c.label}</button>
          ))}</div>
        ) },
        { row: [
          { k: 'date', label: 'Date', type: 'date', required: true },
          { k: 'paidBy', label: 'Paid by', options: db.crew.map((u) => ({ v: u.id, l: `${u.emoji} ${u.name}` })) },
        ] },
        { k: 'split', label: 'Split between (one person = personal expense)', render: (f, set) => (
          <div className="type-pick">{db.crew.map((u) => {
            const on = f.split.includes(u.id)
            return <button type="button" key={u.id} className={`chip cream ${on ? 'on' : ''}`}
              onClick={() => set('split', on ? (f.split.length > 1 ? f.split.filter((x) => x !== u.id) : f.split) : [...f.split, u.id])}>{u.emoji} {u.name}</button>
          })}</div>
        ) },
        { k: 'cityId', label: 'City', empty: 'Pre-trip / other', options: db.cities.map((c) => ({ v: c.id, l: `${c.flag} ${c.name}` })) },
      ]}
      footer={(f) => f.amount > 0 && <p className="convert-preview">≈ {fmtTWD(toHome(f))}{f.split.length > 1 && ` · ${fmtTWD(toHome(f) / f.split.length)} each`}</p>}
      onSave={(f) => (expense.id ? update('expenses', expense.id, f) : add('expenses', f))}
      onDelete={expense.id && (() => remove('expenses', expense.id))}
      onClose={onClose}
    />
  )
}

export default function Money() {
  const { db, person, setTrip, city } = useStore()
  const [params] = useSearchParams()
  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const [budgetOpen, setBudgetOpen] = useState(false)
  const ids = db.crew.map((u) => u.id)
  const all = db.expenses
  const list = all.filter((e) => filter === 'all' || (filter === 'group' ? e.split.length > 1 : e.split.length === 1))
  const total = list.reduce((s, e) => s + toHome(e), 0)
  const budget = db.trip.budgetTWD
  const pct = Math.min(100, (all.reduce((s, e) => s + toHome(e), 0) / budget) * 100)
  const byCat = sumBy(list, 'category')
  const catData = Object.entries(EXPENSE_CATS).map(([key, c]) => ({ key, ...c, value: byCat[key] || 0 })).filter((d) => d.value > 0).sort((a, b) => b.value - a.value)
  const byCity = sumBy(list, 'cityId')
  const cityMax = Math.max(1, ...Object.values(byCity))
  const transfers = settle(balances(all, ids))
  const share = shares(all, ids)
  const paid = sumBy(all, 'paidBy')
  const dates = [...new Set(list.map((e) => e.date))].sort().reverse()

  return (
    <div className="page">
      <PageHeader kicker="who paid for gelato?" title="Expenses" />

      <section className="card money-hero">
        <span className="muted">Total spent{filter !== 'all' && ` (${filter})`}</span>
        <b className="money-big">{fmtTWD(total)}</b>
        <button className="budget" onClick={() => setBudgetOpen(true)}>
          <span className="bar"><i style={{ width: `${pct}%` }} className={pct > 90 ? 'hot' : ''} /></span>
          <span className="muted">{Math.round(pct)}% of {fmtTWD(budget)} budget <Pencil size={12} /></span>
        </button>
        <div className="people">
          {db.crew.map((u) => (
            <div key={u.id} className="person">
              <Avatar id={u.id} size={34} />
              <div><b>{u.name}</b><span className="muted">paid {fmtTWD(paid[u.id] || 0)} · share {fmtTWD(share[u.id] || 0)}</span></div>
            </div>
          ))}
        </div>
      </section>

      <section className="card settle">
        <h3>Settle up</h3>
        {transfers.length ? transfers.map((t, i) => (
          <div key={i} className="settle-row">
            <Avatar id={t.from} size={30} /><span>{person(t.from)?.name}</span><ArrowRight size={16} />
            <Avatar id={t.to} size={30} /><span>{person(t.to)?.name}</span>
            <b className="grow right">{fmtTWD(t.amount)}</b>
          </div>
        )) : <p className="muted">All square 🎉</p>}
      </section>

      <Seg value={filter} onChange={setFilter} options={[{ v: 'all', l: 'All' }, { v: 'group', l: '👯 Shared' }, { v: 'personal', l: '🙋 Personal' }]} />

      {catData.length > 0 && (
        <section className="card chart-card">
          <h3>By category</h3>
          <div className="donut-row">
            <Donut data={catData} />
            <ul className="legend">
              {catData.map((d) => (
                <li key={d.key}><i style={{ background: d.color }} />{d.emoji} {d.label}<b>{Math.round((d.value / total) * 100)}%</b></li>
              ))}
            </ul>
          </div>
          <h3>By city</h3>
          <div className="bars">
            {[...db.cities.map((c) => ({ k: c.id, l: `${c.flag} ${c.name}` })), { k: '', l: '🧳 Pre-trip' }].filter((x) => byCity[x.k]).map((x) => (
              <div key={x.k} className="bar-row">
                <span>{x.l}</span>
                <span className="bar"><i style={{ width: `${(byCity[x.k] / cityMax) * 100}%` }} /></span>
                <b>{fmtTWD(byCity[x.k])}</b>
              </div>
            ))}
          </div>
        </section>
      )}

      {!list.length && <Empty emoji="🪙" title="No expenses yet" text="Tap + to log your first one." />}
      {dates.map((d) => (
        <div key={d} className="day">
          <div className="day-head"><span className="day-num">{fmt(d)}</span></div>
          <div className="stack">
            {list.filter((e) => e.date === d).map((e) => (
              <button key={e.id} className="exp-row" onClick={() => setEditing(e)}>
                <span className="pbubble" style={{ background: EXPENSE_CATS[e.category]?.color }}>{EXPENSE_CATS[e.category]?.emoji}</span>
                <span className="grow">
                  <b>{e.title}</b>
                  <span className="muted">{person(e.paidBy)?.name} paid · {e.split.length > 1 ? 'shared' : `personal (${person(e.split[0])?.name})`}{e.cityId && ` · ${city(e.cityId)?.name}`}</span>
                  <Who row={e} />
                </span>
                <span className="right">
                  <b>{fmtTWD(toHome(e))}</b>
                  {e.currency !== 'TWD' && <span className="muted">{fmtMoney(e.amount, e.currency)} @ {e.rate}</span>}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <Fab label="Add expense" hint={params.get('hint') === 'add'} onClick={() => setEditing({})} />
      {editing && <ExpenseSheet expense={editing} onClose={() => setEditing(null)} />}
      {budgetOpen && (
        <FormSheet title="Trip budget" initial={{ budgetTWD: budget }} onClose={() => setBudgetOpen(false)}
          fields={[{ k: 'budgetTWD', label: 'Total budget (TWD, both of us)', type: 'number', required: true, min: 1 }]}
          onSave={(f) => setTrip({ budgetTWD: Number(f.budgetTWD) })} />
      )}
    </div>
  )
}
