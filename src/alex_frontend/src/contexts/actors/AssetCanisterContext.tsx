import { createActorContext } from "ic-use-actor";

import { _SERVICE } from "../../../../asset_canister/asset_canister.did";

const AssetCanisterContext = createActorContext<_SERVICE>();

export default AssetCanisterContext;