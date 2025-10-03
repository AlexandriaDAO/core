import { createLazyFileRoute } from '@tanstack/react-router'
import Dialectica from '@/apps/app/Dialectica'


export const Route = createLazyFileRoute('/app/dialectica')({
  component: Dialectica
})