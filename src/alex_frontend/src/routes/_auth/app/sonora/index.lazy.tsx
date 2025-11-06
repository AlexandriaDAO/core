import { createLazyFileRoute } from '@tanstack/react-router'
import SonoraPage from '@/pages/sonora'

export const Route = createLazyFileRoute('/_auth/app/sonora/')({
  component: SonoraPage,
})