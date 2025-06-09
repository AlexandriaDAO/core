import { createLazyFileRoute } from '@tanstack/react-router'
import Syllogos from '@/apps/app/Syllogos'

export const Route = createLazyFileRoute('/app/syllogos')({
  component: Syllogos,
})
