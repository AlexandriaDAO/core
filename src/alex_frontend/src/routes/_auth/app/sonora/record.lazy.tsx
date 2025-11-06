import { createLazyFileRoute } from '@tanstack/react-router'
import SonoraRecordPage from '@/pages/sonora/RecordPage'

export const Route = createLazyFileRoute('/_auth/app/sonora/record')({
  component: SonoraRecordPage,
})