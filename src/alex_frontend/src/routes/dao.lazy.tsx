import DAOPage from '@/pages/DAOPage'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/dao')({
  component: DAOPage,
})