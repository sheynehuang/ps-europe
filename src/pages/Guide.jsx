import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'
import { useStore } from '../data/store'
import { seed } from '../data/seed'
import { PageHeader } from '../components/ui'

const S = seed()
const SEED_ITEMS = new Set(S.items.map((i) => i.id))
const SEED_EXPENSES = new Set(S.expenses.map((e) => e.id))
const standalone = () => navigator.standalone === true || matchMedia('(display-mode: standalone)').matches

// Setup steps in the recommended order. `auto` = the app can tell it's done; otherwise the user marks it.
export const STEPS = [
  { key: 'home', emoji: '📲', title: '把 App 加到主畫面',
    why: '全螢幕使用，從主畫面一點就開，登入狀態也會一直保留。',
    how: '用 Safari 打開這個網址 → 下方「分享」→「加入主畫面」。',
    auto: () => standalone(), personal: true },
  { key: 'trip', emoji: '🗓️', title: '設定旅程日期',
    why: '倒數天數、總天數、每一天的 Day 1、Day 2…都是用旅程日期算的，所以第一個設定。',
    how: '在 Plan 頁按右上角閃爍的「✏️ Trip dates」，填出發日和回程日。',
    to: '/plan?hint=trip' },
  { key: 'cities', emoji: '🗺️', title: '設定城市路線',
    why: '行程是依城市分組的。先把城市和日期設好，之後新增行程時會自動放進正確的城市。',
    how: '點城市的彩色標題可以修改，按「+ City」新增。改了城市名一定要按「📍 Find on map」，地圖上才找得到。',
    to: '/plan?hint=city' },
  { key: 'clear', emoji: '🧹', title: '清空範例資料',
    why: '城市設好之後再清空，就不用一筆一筆刪除 29 個範例行程和 10 筆範例花費。城市、旅伴、行前清單、緊急資訊會保留。',
    how: '在 More 頁按閃爍的「🧹 Clear sample data」。這會影響所有旅伴，而且無法復原。',
    to: '/more?hint=clear',
    auto: (db) => !db.items.some((i) => SEED_ITEMS.has(i.id)) && !db.expenses.some((e) => SEED_EXPENSES.has(e.id)) },
  { key: 'bookings', emoji: '✈️', title: '輸入航班與住宿',
    why: '輸入後會自動整理到旅行錢包。在機場、飯店櫃台要報的訂位代碼，一打開就找得到。',
    how: '在 Plan 頁按右下角閃爍的 +，類型選 Flight／Train／Stay，記得填「Confirmation code」。',
    to: '/plan?hint=add',
    auto: (db) => db.items.some((i) => !SEED_ITEMS.has(i.id) && ['flight', 'train', 'hotel'].includes(i.type)) },
  { key: 'money', emoji: '💸', title: '記第一筆花費',
    why: '先到 Tools → Currency 按一次「Fetch latest」抓匯率，之後記帳時就會自動帶入。分攤只選一個人，就是個人花費。',
    how: '在 Money 頁按右下角閃爍的 +。',
    to: '/money?hint=add',
    auto: (db) => db.expenses.some((e) => !SEED_EXPENSES.has(e.id)) },
  { key: 'sos', emoji: '🆘', title: '填好緊急資訊',
    why: '保險公司 24 小時專線、台灣駐外單位的電話，出發前就要查好。出事時點一下就能直接撥打。',
    how: '在 Travel Wallet → Emergency，點「Tap to add」的項目，把電話填進去。',
    to: '/wallet?tab=sos' },
]

export function useGuide() {
  const { db, setSettings } = useStore()
  const marks = db.settings.guide || {}
  const steps = STEPS.map((s) => ({ ...s, done: !!(s.auto?.(db) || (!s.personal && marks[s.key])) }))
  const mark = (key, done) => setSettings({ guide: { ...marks, [key]: done } })
  return { steps, doneCount: steps.filter((s) => s.done).length, mark }
}

export default function Guide() {
  const { steps, doneCount, mark } = useGuide()
  const next = steps.find((s) => !s.done)
  return (
    <div className="page">
      <PageHeader back kicker="step by step" title="Getting started" />
      <section className="card guide-progress">
        <div className="section-head tight"><h3>{doneCount === steps.length ? '全部完成，準備出發！🎉' : '開始設定你們的旅程'}</h3><b>{doneCount}/{steps.length}</b></div>
        <span className="bar"><i style={{ width: `${(doneCount / steps.length) * 100}%` }} /></span>
        <p className="muted small">照順序做最順。完成的步驟會自動打勾，或自己按「標記完成」。進度是旅伴共用的，只有「加到主畫面」是每支手機各自計算。</p>
      </section>

      <div className="stack">
        {steps.map((s, i) => (
          <section key={s.key} className={`guide-step ${s.done ? 'done' : ''} ${s === next ? 'next' : ''}`}>
            <div className="guide-top">
              <span className={`guide-num ${s.done ? 'on' : ''}`}>{s.done ? <Check size={16} /> : i + 1}</span>
              <span className="guide-emoji">{s.emoji}</span>
              <b className="grow">{s.title}</b>
            </div>
            {!s.done && (
              <>
                <p className="guide-why">💡 {s.why}</p>
                <p className="guide-how">👉 {s.how}</p>
                <div className="link-row">
                  {s.to && <Link className="btn primary sm" to={s.to}>前往 <ArrowRight size={14} /></Link>}
                  {!s.auto && <button className="btn ghost sm" onClick={() => mark(s.key, true)}>標記完成</button>}
                </div>
              </>
            )}
            {s.done && !s.auto && <button className="link small" onClick={() => mark(s.key, false)}>取消完成</button>}
          </section>
        ))}
      </div>
    </div>
  )
}

// Compact progress card for the Home page.
export function GuideCard() {
  const { steps, doneCount } = useGuide()
  const [hidden, setHidden] = useState(() => !!localStorage.getItem('ps-guide-hidden'))
  const next = steps.find((s) => !s.done)
  if (!next || hidden) return null
  return (
    <div className="guide-card">
      <Link to="/guide" className="guide-link">
        <span className="guide-emoji">🧭</span>
        <span className="grow">
          <b>開始設定你們的旅程 · {doneCount}/{steps.length}</b>
          <span className="muted small">下一步：{next.emoji} {next.title}</span>
        </span>
        <ArrowRight size={18} />
      </Link>
      <button className="guide-x" aria-label="Hide guide" title="隱藏（之後可從 More 頁打開）"
        onClick={() => { localStorage.setItem('ps-guide-hidden', '1'); setHidden(true) }}>×</button>
    </div>
  )
}
