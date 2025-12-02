import { createFileRoute } from '@tanstack/react-router'
import EmporiumPageSkeleton from '@/layouts/skeletons/emporium/EmporiumPageSkeleton'

export const Route = createFileRoute('/_auth/app/emporium/')({
  loader: () => void 0,
  pendingComponent: EmporiumPageSkeleton,
})