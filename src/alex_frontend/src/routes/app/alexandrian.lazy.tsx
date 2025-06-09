import React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import Alexandrian from '@/apps/app/Alexandrian'
import { LbryActor, NftManagerActor } from '@/actors'

export const Route = createLazyFileRoute('/app/alexandrian')({
  component: ()=>(
    <LbryActor>
      <NftManagerActor>
        <Alexandrian />
      </NftManagerActor>
    </LbryActor>
  ),
})
