import { createLazyFileRoute } from '@tanstack/react-router'
import Imporium from '@/pages/emporium'

export const Route = createLazyFileRoute('/_auth/app/imporium/')({
  component: Imporium,
})