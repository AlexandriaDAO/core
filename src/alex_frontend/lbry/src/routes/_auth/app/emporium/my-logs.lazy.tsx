import { createLazyFileRoute } from '@tanstack/react-router'

import MyLogsPage from './../../../../pages/emporium/MyLogsPage'

export const Route = createLazyFileRoute('/_auth/app/emporium/my-logs')({
  component: MyLogsPage,
})