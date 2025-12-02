import { createActorHook } from "ic-use-actor";
import { _SERVICE } from "../../../../declarations/perpetua/perpetua.did";
import {
	canisterId,
	idlFactory,
} from "../../../../declarations/perpetua";

const usePerpetua = createActorHook<_SERVICE>({
	canisterId: canisterId,
	idlFactory: idlFactory,
});

export default usePerpetua;
