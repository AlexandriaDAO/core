import React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import Alexandrian from '@/apps/app/Alexandrian'
import { LbryActor, NftManagerActor, PerpetuaActor } from '@/actors'

export const Route = createLazyFileRoute('/app/alexandrian')({
  component: ()=>(
    <PerpetuaActor>
      <LbryActor>
        <NftManagerActor>
          <Alexandrian />
        </NftManagerActor>
      </LbryActor>
    </PerpetuaActor>
  ),
})
