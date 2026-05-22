import { NavLink } from 'react-router-dom'
import { hapticSelection } from '../../infra/telegram/telegramHaptic.js'
import './layout.css'

const tabs = [
  {
    to: '/',
    label: 'Главная',
    icon: (
      <svg className="bottom-nav__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3L3 10.5V20a1 1 0 001 1h5v-6h6v6h5a1 1 0 001-1v-9.5L12 3z" />
      </svg>
    ),
  },
  {
    to: '/history',
    label: 'История',
    icon: (
      <svg className="bottom-nav__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1zm2 3v2h10V7H7zm0 4v2h10v-2H7zm0 4v2h6v-2H7z" />
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Настройки',
    icon: (
      <svg className="bottom-nav__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19.14 12.94c.04-.3 0-.63.05-.94 0-.31-.05-.64-.05-.94L22 9.27l-1.95-3.38-2.49 1-1.06-.85C16.1 5.77 15.01 5.37 13.87 5.2L13.5 2h-3L10.13 5.2c-1.14.17-2.23.57-3.24 1.05L5.83 5.2 3.88 9.27 5 11.01c0 .31-.05.64-.05.94s.02.63.05.94L3 14.73l1.95 3.38 2.49-1 1.06.85c1.01.48 2.1.88 3.24 1.05l.37 3.17h3l.37-3.17c1.14-.17 2.23-.57 3.24-1.05l1.06-.85 2.49 1 1.95-3.38L19 14.73c-.03-.31-.05-.64-.05-.94zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5S10.07 8.5 12 8.5s3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
      </svg>
    ),
  },
]

function navClassName({ isActive }) {
  return isActive ? 'bottom-nav__link bottom-nav__link--active' : 'bottom-nav__link'
}

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Основная навигация">
      {tabs.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={navClassName}
          aria-label={label}
          onClick={() => hapticSelection()}
        >
          <span className="bottom-nav__icon-wrap">{icon}</span>
          <span>{label}</span>
          <span className="bottom-nav__dot" aria-hidden="true" />
        </NavLink>
      ))}
    </nav>
  )
}
