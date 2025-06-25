import DetailTransaction from '@/features/swap/components/transactionHistory/detailTransaction'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/swap/transaction')({
  component: DetailTransaction,
})