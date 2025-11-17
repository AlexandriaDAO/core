import { createLazyFileRoute } from '@tanstack/react-router'
import BibliothecaLibraryPage from '@/pages/bibliotheca/LibraryPage'

export const Route = createLazyFileRoute('/_auth/app/bibliotheca/archive/$principal')({
  component: BibliothecaLibraryPage,
})