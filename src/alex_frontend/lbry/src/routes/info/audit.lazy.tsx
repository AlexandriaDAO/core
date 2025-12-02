import AuditPage from './../../pages/AuditPage'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/info/audit')({
  component: AuditPage,
})