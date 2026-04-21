import { createLazyFileRoute } from '@tanstack/react-router'
import MarketPage from './../../../../pages/sonora/MarketPage'

export const Route = createLazyFileRoute('/_auth/app/sonora/market')({
  component: MarketPage,
})
