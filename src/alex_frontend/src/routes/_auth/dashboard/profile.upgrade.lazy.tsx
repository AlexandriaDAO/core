import UpgradePage from '@/pages/dashboard/UpgradePage'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_auth/dashboard/profile/upgrade')({
  component: UpgradePage,
})