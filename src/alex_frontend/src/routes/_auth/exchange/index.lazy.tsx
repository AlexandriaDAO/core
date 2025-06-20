import ExchangePage from '@/pages/exchange'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_auth/exchange/')({
  component: ExchangePage,
})