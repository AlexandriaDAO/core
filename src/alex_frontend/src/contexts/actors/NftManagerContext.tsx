import { createActorContext } from "ic-use-actor";

import { _SERVICE } from "../../../../declarations/nft_manager/nft_manager.did";

const NftManagerContext = createActorContext<_SERVICE>();

export default NftManagerContext;