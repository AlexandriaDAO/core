import React from 'react';
import getMarketLogs from '@/features/imporium/thunks/getMarketLogs';
import { Skeleton } from '@/lib/components/skeleton';
import { store } from '@/store';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/app/imporium/market-logs')({
  loader: () => {
    store.dispatch(getMarketLogs({}));
  },
  pendingComponent: ()=> <Skeleton className="w-full flex-grow rounded" />,
})
