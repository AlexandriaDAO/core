import React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'

import MarketPlacePage from '@/pages/emporium/MarketPlacePage'
import { EmporiumActor, IcpLedgerActor } from '@/actors'
import EmporiumPageSkeleton from '@/layouts/skeletons/emporium/EmporiumPageSkeleton'

export const Route = createLazyFileRoute('/_auth/app/imporium/marketplace')({
  component: ()=>(
    <EmporiumActor>
      <IcpLedgerActor>
        <MarketPlacePage />
      </IcpLedgerActor>
    </EmporiumActor>
  ),
  pendingComponent: EmporiumPageSkeleton,
})