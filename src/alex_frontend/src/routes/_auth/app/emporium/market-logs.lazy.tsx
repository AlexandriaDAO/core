import React from 'react';
import { createLazyFileRoute } from '@tanstack/react-router'
import MarketLogsPage from '@/pages/emporium/MarketLogsPage'
import { Skeleton } from '@/lib/components/skeleton'

export const Route = createLazyFileRoute('/_auth/app/emporium/market-logs')({
  component: MarketLogsPage,
  pendingComponent: ()=> <Skeleton className="w-full flex-grow rounded" />,
})
