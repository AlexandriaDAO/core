import { createActorHook } from "ic-use-actor";
import { _SERVICE } from "../../../../declarations/dialectica/dialectica.did";
import { canisterId, idlFactory } from "../../../../declarations/dialectica";

const useDialectica = createActorHook<_SERVICE>({
	canisterId: canisterId,
	idlFactory: idlFactory,
});

export default useDialectica;