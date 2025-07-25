import { createFileRoute } from '@tanstack/react-router'

import { store } from '@/store'
import getListings from '@/features/imporium/listings/thunks/getListings'
import EmporiumPageSkeleton from '@/layouts/skeletons/emporium/EmporiumPageSkeleton'

export const Route = createFileRoute('/_auth/app/imporium/marketplace')({
  loader: () => {
    const { page, size, sortByPrice, sortByTime } = store.getState().imporium.listings
    store.dispatch(getListings({ page, size, sortByPrice, sortByTime }))
  },
  pendingComponent: EmporiumPageSkeleton,
})