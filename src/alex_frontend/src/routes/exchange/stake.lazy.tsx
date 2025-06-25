import { createLazyFileRoute } from '@tanstack/react-router'
import StakePage from '@/pages/exchange/StakePage'

export const Route = createLazyFileRoute('/exchange/stake')({
  component: StakePage,
})
