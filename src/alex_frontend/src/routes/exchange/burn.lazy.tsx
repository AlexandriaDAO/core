import { createLazyFileRoute } from '@tanstack/react-router'
import BurnPage from '@/pages/exchange/BurnPage'

export const Route = createLazyFileRoute('/exchange/burn')({
  component: BurnPage,
})
