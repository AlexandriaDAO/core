import ArweaveAssetsPage from './../../../pages/dashboard/ArweaveAssetsPage'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_auth/dashboard/arweave-assets')({
  component: ArweaveAssetsPage,
})