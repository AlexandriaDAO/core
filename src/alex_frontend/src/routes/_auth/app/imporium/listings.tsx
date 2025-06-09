import React from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { EmporiumActor } from '@/actors'
import MyListingsPage from '@/pages/emporium/MyListingsPage'

const Route = createFileRoute('/_auth/app/imporium/listings')({
  // https://github.com/TanStack/router/discussions/923
  validateSearch: (search) => ({ search: search.search }),

  component: ()=>(
    <EmporiumActor>
      <MyListingsPage />
    </EmporiumActor>
  ),
})

export { Route }