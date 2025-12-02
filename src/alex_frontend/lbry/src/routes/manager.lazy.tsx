import { createLazyFileRoute } from '@tanstack/react-router'
import ManagerPage from './../pages/ManagerPage'

export const Route = createLazyFileRoute('/manager')({
  component: ManagerPage,
})
