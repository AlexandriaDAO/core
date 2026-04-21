import { createLazyFileRoute } from '@tanstack/react-router'
import UploadPage from './../../../../pages/sonora/UploadPage'

export const Route = createLazyFileRoute('/_auth/app/sonora/upload')({
  component: UploadPage,
})
