import { createLazyFileRoute } from '@tanstack/react-router'
import NftPage from '../pages/NftPage'

export const Route = createLazyFileRoute('/nft/$tokenId')({
  component: NftPage
})