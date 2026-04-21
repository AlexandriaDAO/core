import { createLazyFileRoute } from '@tanstack/react-router'
import StudioPage from './../../../../pages/sonora/StudioPage'

export const Route = createLazyFileRoute('/_auth/app/sonora/studio')({
  component: StudioPage,
})
