import { createActorContext } from "ic-use-actor";

import { _SERVICE } from "../../../../declarations/perpetua/perpetua.did";

const PerpetuaContext = createActorContext<_SERVICE>();

export default PerpetuaContext;