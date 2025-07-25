import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/nft/$tokenId')({
  loader: ()=>void 0,
})