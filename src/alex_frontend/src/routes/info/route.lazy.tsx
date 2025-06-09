import InfoLayout from '@/layouts/InfoLayout'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/info')({
  component: InfoLayout,
})