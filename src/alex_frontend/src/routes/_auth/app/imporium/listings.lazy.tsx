import React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'

import { EmporiumActor } from '@/actors'
import MyListingsPage from '@/pages/emporium/MyListingsPage'

export const Route = createLazyFileRoute('/_auth/app/imporium/listings')({
  component: ()=>(
    <EmporiumActor>
      <MyListingsPage />
    </EmporiumActor>
  ),
})