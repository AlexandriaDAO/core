import { createActorContext } from "ic-use-actor";

import { _SERVICE } from "../../../../declarations/alex_backend/alex_backend.did";

const AlexBackendContext = createActorContext<_SERVICE>();

export default AlexBackendContext;