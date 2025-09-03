import React from 'react';
import { createLazyFileRoute } from '@tanstack/react-router'

import PermaSearchPage from '@/pages/PermaSearchPage'
import { NftManagerActor, PerpetuaActor } from '@/actors'

export const Route = createLazyFileRoute('/app/permasearch')({
  component: ()=>(
    <PerpetuaActor>
      <NftManagerActor>
        <PermaSearchPage />
      </NftManagerActor>
    </PerpetuaActor>
  ),
})
