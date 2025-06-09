import React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'

import { LbryActor, NftManagerActor, AlexBackendActor } from '@/actors'
import Permasearch from '@/apps/app/Permasearch'

export const Route = createLazyFileRoute('/app/permasearch')({
  component: ()=>(
    <LbryActor>
      <NftManagerActor>
        <AlexBackendActor>
          <Permasearch />
        </AlexBackendActor>
      </NftManagerActor>
    </LbryActor>
  ),
})
