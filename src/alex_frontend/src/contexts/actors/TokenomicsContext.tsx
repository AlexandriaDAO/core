import { createActorContext } from "ic-use-actor";

import { _SERVICE } from "../../../../declarations/tokenomics/tokenomics.did";

const TokenomicsContext = createActorContext<_SERVICE>();

export default TokenomicsContext;