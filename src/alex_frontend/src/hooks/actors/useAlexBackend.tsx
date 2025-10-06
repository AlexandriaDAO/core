import { createActorHook } from "ic-use-actor";
import { _SERVICE } from "../../../../declarations/alex_backend/alex_backend.did";
import { canisterId, idlFactory } from "../../../../declarations/alex_backend";

const useAlexBackend = createActorHook<_SERVICE>({
	canisterId: canisterId,
	idlFactory: idlFactory,
});

export default useAlexBackend;
