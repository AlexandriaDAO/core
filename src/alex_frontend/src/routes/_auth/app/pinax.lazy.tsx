import { createLazyFileRoute } from '@tanstack/react-router'

import PinaxPage from '@/pages/PinaxPage'

export const Route = createLazyFileRoute('/_auth/app/pinax')({
  component: PinaxPage,
})

