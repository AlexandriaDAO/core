import { createLazyFileRoute } from '@tanstack/react-router'

import Permasearch from '@/apps/app/Permasearch'

export const Route = createLazyFileRoute('/app/legacy_permasearch')({
  component: Permasearch
})
