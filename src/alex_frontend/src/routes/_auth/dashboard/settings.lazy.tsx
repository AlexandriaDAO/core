import SettingsPage from '@/pages/dashboard/SettingsPage'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_auth/dashboard/settings')({
  component: SettingsPage,
})
