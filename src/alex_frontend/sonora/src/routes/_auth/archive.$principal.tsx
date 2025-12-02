import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/archive/$principal')({
  loader: () => void 0,
})