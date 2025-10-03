import { createActorHook } from "ic-use-actor";
import { _SERVICE } from "../../../../declarations/emporium/emporium.did";
import { canisterId, idlFactory } from "../../../../declarations/emporium";

const useEmporium = createActorHook<_SERVICE>({
	canisterId: canisterId,
	idlFactory: idlFactory,
});

export default useEmporium;
