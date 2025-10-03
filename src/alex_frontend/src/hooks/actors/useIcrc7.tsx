import { createActorHook } from "ic-use-actor";
import { _SERVICE } from "../../../../declarations/icrc7/icrc7.did";
import { canisterId, idlFactory } from "../../../../declarations/icrc7";

const useIcrc7 = createActorHook<_SERVICE>({
	canisterId: canisterId,
	idlFactory: idlFactory,
});

export default useIcrc7;
