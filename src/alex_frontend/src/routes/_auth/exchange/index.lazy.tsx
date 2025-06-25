import React from 'react';
import { IcpLedgerActor, IcpSwapActor } from '@/actors'
import ExchangePage from '@/pages/exchange'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_auth/exchange/')({
  component: ()=>(
    <IcpSwapActor>
      <IcpLedgerActor>
        <ExchangePage />
      </IcpLedgerActor>
    </IcpSwapActor>
  ),
})