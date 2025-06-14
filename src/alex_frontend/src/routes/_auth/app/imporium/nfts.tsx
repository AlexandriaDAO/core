import { createFileRoute } from '@tanstack/react-router'
import NftsPageSkeleton from '@/layouts/skeletons/emporium/NftsPageSkeleton';
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
  pendingComponent: NftsPageSkeleton,
})


export { Route };