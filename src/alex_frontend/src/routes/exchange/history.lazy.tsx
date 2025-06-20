import { createLazyFileRoute } from '@tanstack/react-router'
import HistoryPage from '@/pages/exchange/HistoryPage'

export const Route = createLazyFileRoute('/exchange/history')({
  component: HistoryPage,
})