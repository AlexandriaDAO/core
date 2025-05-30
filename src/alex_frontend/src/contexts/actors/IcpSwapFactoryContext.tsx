import { createActorContext } from "ic-use-actor";

import { _SERVICE } from "../../../../declarations/icp_swap_factory/icp_swap_factory.did";

const IcpSwapFactoryContext = createActorContext<_SERVICE>();

export default IcpSwapFactoryContext;