import LibrarianPage from './../../../../pages/librarian'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_auth/dashboard/_librarian/')({
  component: LibrarianPage,
})