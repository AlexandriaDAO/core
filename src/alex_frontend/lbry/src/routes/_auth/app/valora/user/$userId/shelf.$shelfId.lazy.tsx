import { createLazyFileRoute } from '@tanstack/react-router'
import ValoraPage from './../../../../../../pages/valora'

export const Route = createLazyFileRoute(
	'/_auth/app/valora/user/$userId/shelf/$shelfId',
)({
	component: ValoraPage,
})
