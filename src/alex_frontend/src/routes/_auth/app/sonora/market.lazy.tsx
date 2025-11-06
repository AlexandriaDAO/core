import { createLazyFileRoute } from '@tanstack/react-router'
import SonoraMarketPage from '@/pages/sonora/MarketPage'

export const Route = createLazyFileRoute('/_auth/app/sonora/market')({
  component: SonoraMarketPage,
})