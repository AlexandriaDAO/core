import { createActorContext } from "ic-use-actor";

import { _SERVICE } from "../../../../declarations/icp_swap/icp_swap.did";

const IcpSwapContext = createActorContext<_SERVICE>();

export default IcpSwapContext;