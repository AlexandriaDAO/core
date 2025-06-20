import React from 'react';
import { createLazyFileRoute } from '@tanstack/react-router'
import HistoryPage from '@/pages/exchange/HistoryPage'
import { AlexActor, LbryActor } from '@/actors';

export const Route = createLazyFileRoute('/exchange/history')({
  component: ()=>(
    <LbryActor>
      <AlexActor>
        <HistoryPage />
      </AlexActor>
    </LbryActor>
  ),
})