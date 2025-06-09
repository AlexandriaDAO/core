import LibrarianGuard from '@/guards/LibrarianGuard'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_auth/dashboard/_librarian')({
  component: LibrarianGuard,
})