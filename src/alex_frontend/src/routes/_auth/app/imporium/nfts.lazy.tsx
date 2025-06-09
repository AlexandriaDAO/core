import NftsPage from '@/pages/emporium/NftsPage'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_auth/app/imporium/nfts')({
  component: NftsPage,
})
