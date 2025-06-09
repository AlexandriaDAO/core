import SwapPage from '@/pages/swap'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/swap/topup')({
  component: SwapPage,
})
