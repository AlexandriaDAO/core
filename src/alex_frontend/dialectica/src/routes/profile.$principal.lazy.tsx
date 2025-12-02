import { createLazyFileRoute } from '@tanstack/react-router';
import PublicProfilePage from '../pages/PublicProfilePage';

export const Route = createLazyFileRoute('/profile/$principal')({
  component: PublicProfilePage,
});