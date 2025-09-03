import React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { EmporiumActor, Icrc7Actor, LbryActor, NftManagerActor, PerpetuaActor } from '@/actors'
import AlexandrianPage from '@/pages/AlexandrianPage'

export const Route = createLazyFileRoute('/app/alexandrian')({
  component: ()=>(
    <PerpetuaActor>
      <LbryActor>
        <NftManagerActor>
          <EmporiumActor>
            <Icrc7Actor>
              <AlexandrianPage />
            </Icrc7Actor>
          </EmporiumActor>
        </NftManagerActor>
      </LbryActor>
    </PerpetuaActor>
  ),
})
