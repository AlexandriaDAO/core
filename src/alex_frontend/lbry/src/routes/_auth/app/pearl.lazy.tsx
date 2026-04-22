import { createLazyFileRoute } from '@tanstack/react-router'
import PearlPage from './../../../pages/pearl/PearlPage'

export const Route = createLazyFileRoute('/_auth/app/pearl')({
  component: PearlPage,
})
