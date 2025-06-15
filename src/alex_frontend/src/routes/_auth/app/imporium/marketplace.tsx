import { createFileRoute } from '@tanstack/react-router'

import { store } from '@/store'
import getListings from '@/features/imporium/listings/thunks/getListings'
import NftsPageSkeleton from '@/layouts/skeletons/emporium/NftsPageSkeleton'

export const Route = createFileRoute('/_auth/app/imporium/marketplace')({
  validateSearch: (search) => ({ search: search.search }),
  loader: () => store.dispatch(getListings()),
  pendingComponent: NftsPageSkeleton,
})