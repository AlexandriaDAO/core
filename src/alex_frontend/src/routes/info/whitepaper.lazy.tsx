import { createLazyFileRoute } from '@tanstack/react-router'
import WhitepaperPage from '@/pages/WhitepaperPage'

export const Route = createLazyFileRoute('/info/whitepaper')({
  component: WhitepaperPage,
})
