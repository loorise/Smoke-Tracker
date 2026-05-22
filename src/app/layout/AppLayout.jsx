import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav.jsx'
import './layout.css'

export function AppLayout() {
  return (
    <div className="layout">
      <header className="layout__header">
        <p className="layout__brand">Smoke Tracker</p>
      </header>
      <main className="layout__main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
