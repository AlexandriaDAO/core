import React from 'react';
import { Skeleton } from '@/lib/components/skeleton';

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/app/emporium/my-logs')({
  loader: () => void 0,
  pendingComponent: ()=> <Skeleton className="w-full flex-grow rounded" />,
})