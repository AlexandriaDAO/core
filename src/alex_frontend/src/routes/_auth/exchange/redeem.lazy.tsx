import { createLazyFileRoute } from '@tanstack/react-router'
import RedeemPage from '@/pages/exchange/RedeemPage'

export const Route = createLazyFileRoute('/_auth/exchange/redeem')({
  component: RedeemPage,
})