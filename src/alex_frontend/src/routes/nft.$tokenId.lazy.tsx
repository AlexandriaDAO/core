import React from 'react';
import { createLazyFileRoute } from '@tanstack/react-router'
import { NftManagerActor, PerpetuaActor } from '@/actors'
import SingleTokenView from '@/apps/Modules/AppModules/blinks/SingleTokenView'

export const Route = createLazyFileRoute('/nft/$tokenId')({
  component: ()=>(
    <PerpetuaActor>
      <NftManagerActor>
        <SingleTokenView />
      </NftManagerActor>
    </PerpetuaActor>
  ),
})