import React from 'react';
import { createLazyFileRoute } from '@tanstack/react-router'

import PermaFindPage from '@/pages/PermaFindPage'
import { NftManagerActor, PerpetuaActor } from '@/actors'

export const Route = createLazyFileRoute('/app/permafind')({
  component: ()=>(
    <PerpetuaActor>
      <NftManagerActor>
        <PermaFindPage />
      </NftManagerActor>
    </PerpetuaActor>
  ),
})
