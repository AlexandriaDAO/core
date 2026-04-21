import { createLazyFileRoute } from '@tanstack/react-router'
import BrowsePage from './../../../../pages/sonora/BrowsePage'

export const Route = createLazyFileRoute('/_auth/app/sonora/')({
  component: BrowsePage,
})
