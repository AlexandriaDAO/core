import { createLazyFileRoute } from '@tanstack/react-router'
import BibliothecaMarketPage from '@/pages/bibliotheca/MarketPage'

export const Route = createLazyFileRoute('/_auth/app/bibliotheca/market')({
  component: BibliothecaMarketPage,
})