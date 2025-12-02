import { createActorHook } from "ic-use-actor";
import { _SERVICE } from "../../../../declarations/asset_manager/asset_manager.did";
import { canisterId, idlFactory } from "../../../../declarations/asset_manager";

const useAssetManager = createActorHook<_SERVICE>({
	canisterId: canisterId,
	idlFactory: idlFactory,
});

export default useAssetManager;
