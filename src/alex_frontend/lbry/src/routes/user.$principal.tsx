import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$principal')({
  loader: () => void 0,
})
