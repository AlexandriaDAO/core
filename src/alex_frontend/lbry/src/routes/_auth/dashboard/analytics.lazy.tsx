import AnalyticsPage from '../../../pages/dashboard/AnalyticsPage'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_auth/dashboard/analytics')({
  component: AnalyticsPage,
})
