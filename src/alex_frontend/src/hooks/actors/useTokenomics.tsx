import { createActorHook } from "ic-use-actor";
import { _SERVICE } from "../../../../declarations/tokenomics/tokenomics.did";
import { canisterId, idlFactory } from "../../../../declarations/tokenomics";

const useTokenomics = createActorHook<_SERVICE>({
	canisterId: canisterId,
	idlFactory: idlFactory,
});

export default useTokenomics;
