import { createLazyFileRoute } from '@tanstack/react-router'
import StatusPage from './../pages/StatusPage'

export const Route = createLazyFileRoute('/status')({
  component: StatusPage,
})
