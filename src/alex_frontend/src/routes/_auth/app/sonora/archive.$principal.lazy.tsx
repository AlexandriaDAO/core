import { createLazyFileRoute } from '@tanstack/react-router'
import SonoraArchivePage from '@/pages/sonora/ArchivePage'

export const Route = createLazyFileRoute('/_auth/app/sonora/archive/$principal')({
  component: SonoraArchivePage,
})