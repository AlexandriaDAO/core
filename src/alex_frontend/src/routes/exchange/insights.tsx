import { createFileRoute } from '@tanstack/react-router'
import { store } from '@/store';
import { getAllLogs } from '@/features/insights';

export const Route = createFileRoute('/exchange/insights')({
  loader: () => {
    store.dispatch(getAllLogs());
  }
})
