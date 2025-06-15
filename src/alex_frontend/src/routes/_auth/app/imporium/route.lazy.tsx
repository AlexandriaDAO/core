import EmporiumLayout from '@/layouts/EmporiumLayout'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_auth/app/imporium')({
  component: EmporiumLayout,
})