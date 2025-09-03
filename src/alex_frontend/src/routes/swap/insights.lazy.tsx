import InsightsPage from '@/pages/exchange/InsightsPage'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/swap/insights')({
  component: InsightsPage,
})
