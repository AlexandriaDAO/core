import { createLazyFileRoute } from '@tanstack/react-router'
import SonoraUploadPage from '@/pages/sonora/UploadPage'

export const Route = createLazyFileRoute('/_auth/app/sonora/upload')({
  component: SonoraUploadPage,
})