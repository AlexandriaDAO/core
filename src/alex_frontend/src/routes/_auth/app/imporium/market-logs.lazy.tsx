import { createLazyFileRoute } from '@tanstack/react-router'
import MarketLogsPage from '@/pages/emporium/MarketLogsPage'

export const Route = createLazyFileRoute('/_auth/app/imporium/market-logs')({
  component: MarketLogsPage,
})
