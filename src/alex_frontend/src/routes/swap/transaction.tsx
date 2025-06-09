import DetailTransaction from '@/features/swap/components/transactionHistory/detailTransaction'
import { createFileRoute } from '@tanstack/react-router'

const Route = createFileRoute('/swap/transaction')({
  validateSearch: (search) => ({ id: search.id }),
  component: DetailTransaction,
})

export { Route };