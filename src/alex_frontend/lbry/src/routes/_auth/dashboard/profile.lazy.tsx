import ProfilePage from './../../../pages/dashboard/ProfilePage'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_auth/dashboard/profile')({
  component: ProfilePage,
})