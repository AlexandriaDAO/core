import ICPAssetsPage from './../../../pages/dashboard/ICPAssetsPage'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_auth/dashboard/icp-assets')({
  component: ICPAssetsPage,
})