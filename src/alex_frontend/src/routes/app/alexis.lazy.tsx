import React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { LbryActor, NftManagerActor, PerpetuaActor } from '@/actors'
import Alexis from '@/pages/AlexisPage'

export const Route = createLazyFileRoute('/app/alexis')({
  component: ()=>(
    <PerpetuaActor>
      <LbryActor>
        <NftManagerActor>
          <Alexis />
        </NftManagerActor>
      </LbryActor>
    </PerpetuaActor>
  ),
})
