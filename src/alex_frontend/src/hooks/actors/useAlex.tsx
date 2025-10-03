import { createActorHook } from "ic-use-actor";
import { _SERVICE } from "../../../../declarations/ALEX/ALEX.did";
import { canisterId, idlFactory } from "../../../../declarations/ALEX";

const useAlex = createActorHook<_SERVICE>({
	canisterId: canisterId,
	idlFactory: idlFactory,
});

export default useAlex;
