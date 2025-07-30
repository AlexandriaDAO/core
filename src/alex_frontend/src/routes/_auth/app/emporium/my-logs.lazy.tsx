import React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'

import { EmporiumActor } from '@/actors'
import MyLogsPage from '@/pages/emporium/MyLogsPage'

export const Route = createLazyFileRoute('/_auth/app/emporium/my-logs')({
  component: ()=>(
    <EmporiumActor>
      <MyLogsPage />
    </EmporiumActor>
  ),
})