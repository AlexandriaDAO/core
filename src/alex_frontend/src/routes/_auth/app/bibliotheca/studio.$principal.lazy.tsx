import { createLazyFileRoute } from '@tanstack/react-router'
import BibliothecaShelfPage from '@/pages/bibliotheca/ShelfPage'

export const Route = createLazyFileRoute('/_auth/app/bibliotheca/studio/$principal')({
  component: BibliothecaShelfPage,
})