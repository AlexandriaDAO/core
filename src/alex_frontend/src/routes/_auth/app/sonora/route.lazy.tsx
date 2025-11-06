import SonoraLayout from '@/layouts/SonoraLayout'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_auth/app/sonora')({
  component: SonoraLayout,
})