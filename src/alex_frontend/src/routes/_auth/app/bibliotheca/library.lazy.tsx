import { createLazyFileRoute } from '@tanstack/react-router'
import BibliothecaLibraryPage from '@/pages/bibliotheca/LibraryPage'

export const Route = createLazyFileRoute('/_auth/app/bibliotheca/library')({
  component: BibliothecaLibraryPage,
})