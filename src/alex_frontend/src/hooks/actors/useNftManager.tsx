import { createActorHook } from "ic-use-actor";
import { _SERVICE } from "../../../../declarations/nft_manager/nft_manager.did";
import { canisterId, idlFactory } from "../../../../declarations/nft_manager";

const useNftManager = createActorHook<_SERVICE>({
	canisterId: canisterId,
	idlFactory: idlFactory,
});

export default useNftManager;
