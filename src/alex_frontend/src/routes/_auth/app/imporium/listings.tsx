import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/app/imporium/listings')({
  // https://github.com/TanStack/router/discussions/923
  validateSearch: (search) => ({ search: search.search as any }),
})