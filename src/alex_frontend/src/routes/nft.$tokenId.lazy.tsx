import { createLazyFileRoute } from '@tanstack/react-router'
import SingleTokenView from '@/apps/Modules/AppModules/blinks/SingleTokenView'

export const Route = createLazyFileRoute('/nft/$tokenId')({
  component: SingleTokenView,
})