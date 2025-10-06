import { createLazyFileRoute } from '@tanstack/react-router'
import Alexandrian from '@/apps/app/Alexandrian'

export const Route = createLazyFileRoute('/app/legacy_alexandrian')({
  component: Alexandrian
})
