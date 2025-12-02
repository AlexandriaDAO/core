import { createLazyFileRoute } from '@tanstack/react-router'

import PermaSearchPage from './../../pages/PermaSearchPage'

export const Route = createLazyFileRoute('/app/permasearch')({
  component: PermaSearchPage
})
