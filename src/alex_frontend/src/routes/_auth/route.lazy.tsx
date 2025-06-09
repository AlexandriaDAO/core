import { createLazyFileRoute } from '@tanstack/react-router'
import AuthGuard from '@/guards/AuthGuard';

export const Route = createLazyFileRoute('/_auth')({
  component: AuthGuard,
})