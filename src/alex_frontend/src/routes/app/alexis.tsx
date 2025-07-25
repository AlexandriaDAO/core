import { createFileRoute } from '@tanstack/react-router'

const Route = createFileRoute('/app/alexis')({
  loader: ()=>void 0,
})

export {Route};