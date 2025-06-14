import { createLazyFileRoute } from '@tanstack/react-router'
import NftsPage from '@/pages/emporium/NftsPage'
import NftsPageSkeleton from '@/layouts/skeletons/emporium/NftsPageSkeleton'

export const Route = createLazyFileRoute('/_auth/app/imporium/nfts')({
  component: NftsPage,
  pendingComponent: NftsPageSkeleton,
})
