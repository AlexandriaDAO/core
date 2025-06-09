import React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'

import { AlexWalletActor, NftManagerActor, LbryActor } from '@/actors'
import PinaxPage from '@/pages/PinaxPage'

export const Route = createLazyFileRoute('/_auth/app/pinax')({
  component: ()=>(
    <AlexWalletActor>
      <NftManagerActor>
        <LbryActor>
          <PinaxPage />
        </LbryActor>
      </NftManagerActor>
    </AlexWalletActor>
  ),
})

