import { createLazyFileRoute } from '@tanstack/react-router'

import EmporiumPage from '@/pages/emporium'
import EmporiumPageSkeleton from '@/layouts/skeletons/emporium/EmporiumPageSkeleton'

export const Route = createLazyFileRoute('/_auth/app/emporium/')({
  component: EmporiumPage,
  pendingComponent: EmporiumPageSkeleton,
})