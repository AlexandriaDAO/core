import { createLazyFileRoute } from '@tanstack/react-router'
import PerpetuaPage from './../../../../pages/perpetua'

export const Route = createLazyFileRoute('/_auth/app/perpetua/')({
	component: PerpetuaPage,
})
