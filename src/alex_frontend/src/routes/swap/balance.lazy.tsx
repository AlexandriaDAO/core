import { createLazyFileRoute } from '@tanstack/react-router'
import SwapPage from '@/pages/swap'

export const Route = createLazyFileRoute('/swap/balance')({
  component: SwapPage,
})