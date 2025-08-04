import React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { EmporiumActor, Icrc7Actor, LbryActor, NftManagerActor, PerpetuaActor } from '@/actors'
import Alexis from '@/pages/AlexisPage'

export const Route = createLazyFileRoute('/app/alexis')({
  component: ()=>(
    <PerpetuaActor>
      <LbryActor>
        <NftManagerActor>
          <EmporiumActor>
            <Icrc7Actor>
              <Alexis />
            </Icrc7Actor>
          </EmporiumActor>
        </NftManagerActor>
      </LbryActor>
    </PerpetuaActor>
  ),
})
