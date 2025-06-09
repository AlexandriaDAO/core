import React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'

import MarketPlacePage from '@/pages/emporium/MarketPlacePage'
import { EmporiumActor } from '@/actors'

export const Route = createLazyFileRoute('/_auth/app/imporium/marketplace')({
  component: ()=>(
    <EmporiumActor>
      <MarketPlacePage />
    </EmporiumActor>
  ),
})