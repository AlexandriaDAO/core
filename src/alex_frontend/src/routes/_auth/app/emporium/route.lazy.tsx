import EmporiumLayout from '@/layouts/EmporiumLayout'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_auth/app/emporium')({
  component: EmporiumLayout,
})