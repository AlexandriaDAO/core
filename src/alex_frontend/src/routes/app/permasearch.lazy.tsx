import React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'

import { LbryActor, NftManagerActor, AlexBackendActor, PerpetuaActor } from '@/actors'
import Permasearch from '@/apps/app/Permasearch'

export const Route = createLazyFileRoute('/app/permasearch')({
  component: ()=>(
    <PerpetuaActor>
      <LbryActor>
        <NftManagerActor>
          <AlexBackendActor>
            <Permasearch />
          </AlexBackendActor>
        </NftManagerActor>
      </LbryActor>
    </PerpetuaActor>
  ),
})
