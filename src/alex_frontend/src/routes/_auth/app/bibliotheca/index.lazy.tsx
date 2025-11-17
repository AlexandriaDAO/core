import { createLazyFileRoute } from '@tanstack/react-router'
import BibliothecaPage from '@/pages/bibliotheca'

export const Route = createLazyFileRoute('/_auth/app/bibliotheca/')({
  component: BibliothecaPage,
})