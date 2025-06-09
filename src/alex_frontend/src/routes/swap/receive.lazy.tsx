import { createLazyFileRoute } from '@tanstack/react-router'
import SwapPage from '@/pages/swap'

export const Route = createLazyFileRoute('/swap/receive')({
  component: SwapPage,
})
