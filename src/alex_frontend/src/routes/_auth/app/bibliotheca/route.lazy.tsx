import BibliothecaLayout from '@/layouts/BibliothecaLayout'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_auth/app/bibliotheca')({
  component: BibliothecaLayout,
})