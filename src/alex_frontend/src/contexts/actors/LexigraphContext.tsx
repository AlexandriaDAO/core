import { createActorContext } from "ic-use-actor";

import { _SERVICE } from "../../../../declarations/lexigraph/lexigraph.did";

const LexigraphContext = createActorContext<_SERVICE>();

export default LexigraphContext;