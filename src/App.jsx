import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Home as HomeIcon, CalendarDays, Compass, PiggyBank, LayoutGrid } from 'lucide-react'
import { StoreProvider, useStore } from './data/store'
import Login, { NotMember } from './pages/Login'
import Home from './pages/Home'
import Plan from './pages/Plan'
import Explore from './pages/Explore'
import Money from './pages/Money'
import More from './pages/More'
import Wallet from './pages/Wallet'
import Memories from './pages/Memories'
import Crew from './pages/Crew'
import Tools from './pages/Tools'

const TABS = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/plan', label: 'Plan', icon: CalendarDays },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/money', label: 'Money', icon: PiggyBank },
  { to: '/more', label: 'More', icon: LayoutGrid, also: ['/wallet', '/memories', '/crew', '/tools'] },
]

function TabBar() {
  const { pathname } = useLocation()
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map(({ to, label, icon: Icon, also = [] }) => {
        const on = to === '/' ? pathname === '/' : pathname.startsWith(to) || also.some((a) => pathname.startsWith(a))
        return (
          <NavLink key={to} to={to} className={`tab ${on ? 'on' : ''}`} aria-current={on ? 'page' : undefined}>
            <Icon size={22} strokeWidth={2.2} /><span>{label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function Gate({ children }) {
  const { session, status } = useStore()
  if (session === undefined) return <div className="splash"><span className="ps">PS.</span></div>
  if (!session) return <main className="app"><Login /></main>
  if (status === 'not-member') return <main className="app"><NotMember /></main>
  return children
}

export default function App() {
  return (
    <StoreProvider>
      <Gate>
      <HashRouter>
        <ScrollTop />
        <main className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/money" element={<Money />} />
            <Route path="/more" element={<More />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/memories" element={<Memories />} />
            <Route path="/crew" element={<Crew />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <TabBar />
      </HashRouter>
      </Gate>
    </StoreProvider>
  )
}
