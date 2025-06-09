import React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'

import { LbryActor, NftManagerActor, EmporiumActor } from '@/actors'
import Emporium from '@/apps/app/Emporium'

export const Route = createLazyFileRoute('/app/emporium')({
  component: ()=>(
    <LbryActor>
      <NftManagerActor>
        <EmporiumActor>
          <Emporium />
        </EmporiumActor>
      </NftManagerActor>
    </LbryActor>
  ),
})