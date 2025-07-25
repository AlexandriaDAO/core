import React from 'react';
import { createLazyFileRoute } from '@tanstack/react-router'

import PermaFindPage from '@/pages/PermaFindPage'
import { NftManagerActor } from '@/actors'

export const Route = createLazyFileRoute('/app/permafind')({
  component: ()=>(
    <NftManagerActor>
      <PermaFindPage />
    </NftManagerActor>
  ),
})
