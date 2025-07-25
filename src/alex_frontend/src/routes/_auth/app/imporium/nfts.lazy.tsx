import React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import NftsPage from '@/pages/emporium/NftsPage'
import EmporiumPageSkeleton from '@/layouts/skeletons/emporium/EmporiumPageSkeleton'
import { EmporiumActor, Icrc7Actor } from '@/actors'

export const Route = createLazyFileRoute('/_auth/app/imporium/nfts')({
  component: ()=>(
    <EmporiumActor>
      <Icrc7Actor>
        <NftsPage />
      </Icrc7Actor>
    </EmporiumActor>
  ),
  pendingComponent: EmporiumPageSkeleton,
})