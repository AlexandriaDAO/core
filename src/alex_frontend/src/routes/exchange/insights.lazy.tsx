import { createLazyFileRoute } from '@tanstack/react-router'
import InsightsPage from '@/pages/exchange/InsightsPage'

export const Route = createLazyFileRoute('/exchange/insights')({
  component: InsightsPage
})