import Bibliotheca from '@/apps/app/Bibliotheca'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/app/bibliotheca')({
  component: Bibliotheca,
})
