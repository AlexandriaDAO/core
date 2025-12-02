import { createLazyFileRoute } from '@tanstack/react-router'
import AlexandrianPage from './../../pages/AlexandrianPage'

export const Route = createLazyFileRoute('/app/alexandrian')({
  component: AlexandrianPage,
})
