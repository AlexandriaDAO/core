import { createLazyFileRoute } from '@tanstack/react-router'
import RecordPage from './../../../../pages/sonora/RecordPage'

export const Route = createLazyFileRoute('/_auth/app/sonora/record')({
  component: RecordPage,
})
