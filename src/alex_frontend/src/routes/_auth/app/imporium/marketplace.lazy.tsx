import React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'

import MarketPlacePage from '@/pages/emporium/MarketPlacePage'
import { EmporiumActor, IcpLedgerActor } from '@/actors'
import NftsPageSkeleton from '@/layouts/skeletons/emporium/NftsPageSkeleton'

export const Route = createLazyFileRoute('/_auth/app/imporium/marketplace')({
  component: ()=>(
    <EmporiumActor>
      <IcpLedgerActor>
        <MarketPlacePage />
      </IcpLedgerActor>
    </EmporiumActor>
  ),
  pendingComponent: NftsPageSkeleton,
})