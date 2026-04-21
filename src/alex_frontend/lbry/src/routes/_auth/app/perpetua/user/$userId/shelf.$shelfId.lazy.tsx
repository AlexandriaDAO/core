import { createLazyFileRoute } from '@tanstack/react-router'
import PerpetuaPage from './../../../../../../pages/perpetua'

export const Route = createLazyFileRoute(
	'/_auth/app/perpetua/user/$userId/shelf/$shelfId',
)({
	component: PerpetuaPage,
})
