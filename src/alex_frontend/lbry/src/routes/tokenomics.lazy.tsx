import { createLazyFileRoute } from '@tanstack/react-router'
import TokenomicsPage from './../pages/TokenomicsPage'

export const Route = createLazyFileRoute('/tokenomics')({
  component: TokenomicsPage,
})
