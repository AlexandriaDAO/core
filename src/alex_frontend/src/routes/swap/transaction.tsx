import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/swap/transaction')({
  validateSearch: (search: Record<string, unknown>) => ({ 
    id: search.id as string | undefined 
  }),
})