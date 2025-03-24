import { createActorContext } from "ic-use-actor";

import { _SERVICE } from "../../../../declarations/asset_manager/asset_manager.did";

const AssetManagerContext = createActorContext<_SERVICE>();

export default AssetManagerContext;