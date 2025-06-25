import { createLazyFileRoute } from '@tanstack/react-router'
import BurnPage from '@/pages/exchange/BurnPage'

export const Route = createLazyFileRoute('/_auth/exchange/burn')({
  component: BurnPage,
})
