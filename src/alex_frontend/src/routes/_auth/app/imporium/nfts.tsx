import { createFileRoute } from '@tanstack/react-router'
import EmporiumPageSkeleton from '@/layouts/skeletons/emporium/EmporiumPageSkeleton';
import getMyTokens from '@/features/imporium/nfts/thunks/getMyTokens';
import { store } from '@/store';

const Route = createFileRoute('/_auth/app/imporium/nfts')({
  loader: () => {
    // user may or may not be available yet
    // depending on wether route is directly loaded via in app link navigation
    const { user } = store.getState().auth;
    if(user) {
      store.dispatch(getMyTokens());
      return true;
    }
    return false;
  },
  pendingComponent: EmporiumPageSkeleton,
})


export { Route };