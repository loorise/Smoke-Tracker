import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout.jsx'
import { HomePage } from '../features/home/HomePage.jsx'
import { HistoryPage } from '../features/history/HistoryPage.jsx'
import { SettingsPage } from '../features/settings/SettingsPage.jsx'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])
