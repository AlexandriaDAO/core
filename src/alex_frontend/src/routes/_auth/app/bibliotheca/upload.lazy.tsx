import { createLazyFileRoute } from '@tanstack/react-router'
import BibliothecaUploadPage from '@/pages/bibliotheca/UploadPage'

export const Route = createLazyFileRoute('/_auth/app/bibliotheca/upload')({
  component: BibliothecaUploadPage,
})