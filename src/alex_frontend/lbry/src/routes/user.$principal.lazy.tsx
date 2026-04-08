import { createLazyFileRoute } from '@tanstack/react-router'
import UserProfilePage from '../pages/UserProfilePage'

export const Route = createLazyFileRoute('/user/$principal')({
  component: UserProfilePage,
})
