import React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { EmporiumActor, LbryActor, NftManagerActor } from '@/actors'
import Dialectica from '@/apps/app/Dialectica'


export const Route = createLazyFileRoute('/app/dialectica')({
  component: ()=>(
    <LbryActor>
      <NftManagerActor>
        <EmporiumActor>
          <Dialectica />
        </EmporiumActor>
      </NftManagerActor>
    </LbryActor>
  ),
})