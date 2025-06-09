import Perpetua from '@/apps/app/Perpetua'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/app/perpetua/user/$userId/')({
  component: Perpetua,
})