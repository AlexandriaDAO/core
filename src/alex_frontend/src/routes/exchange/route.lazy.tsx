import { createLazyFileRoute } from '@tanstack/react-router'
import ExchangeLayout from '@/layouts/ExchangeLayout'

export const Route = createLazyFileRoute('/exchange')({
  component: ExchangeLayout,
})