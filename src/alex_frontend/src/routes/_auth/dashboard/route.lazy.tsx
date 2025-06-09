import DashboardLayout from '@/layouts/DashboardLayout'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_auth/dashboard')({
  component: DashboardLayout,
})