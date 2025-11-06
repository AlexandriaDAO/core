import { createLazyFileRoute } from '@tanstack/react-router'
import SonoraStudioPage from '@/pages/sonora/StudioPage'

export const Route = createLazyFileRoute('/_auth/app/sonora/studio/$principal')({
  component: SonoraStudioPage,
})