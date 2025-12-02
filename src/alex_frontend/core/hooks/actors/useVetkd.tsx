import { createActorHook } from "ic-use-actor";
import { _SERVICE } from "../../../../declarations/vetkd/vetkd.did";
import { canisterId, idlFactory } from "../../../../declarations/vetkd";

const useVetkd = createActorHook<_SERVICE>({
	canisterId: canisterId,
	idlFactory: idlFactory,
});
export default useVetkd;
