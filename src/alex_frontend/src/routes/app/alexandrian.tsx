import { createFileRoute } from '@tanstack/react-router'

const Route = createFileRoute('/app/alexandrian')({
  loader: ()=>void 0,
})

export {Route};