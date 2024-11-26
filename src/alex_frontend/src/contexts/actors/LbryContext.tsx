import { createActorContext } from "ic-use-actor";

import { _SERVICE } from "../../../../declarations/LBRY/LBRY.did";

const LbryContext = createActorContext<_SERVICE>();

export default LbryContext;