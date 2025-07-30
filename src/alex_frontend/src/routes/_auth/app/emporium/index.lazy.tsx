import React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'

import EmporiumPage from '@/pages/emporium'
import { EmporiumActor, IcpLedgerActor } from '@/actors'
import EmporiumPageSkeleton from '@/layouts/skeletons/emporium/EmporiumPageSkeleton'

export const Route = createLazyFileRoute('/_auth/app/emporium/')({
  component: ()=>(
    <EmporiumActor>
      <IcpLedgerActor>
        <EmporiumPage />
      </IcpLedgerActor>
    </EmporiumActor>
  ),
  pendingComponent: EmporiumPageSkeleton,
})