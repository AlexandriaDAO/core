import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/studio/$principal')({
  loader: () => void 0,
})