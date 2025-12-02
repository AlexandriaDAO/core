import { createActorHook } from "ic-use-actor";
import { _SERVICE } from "../../../../declarations/stripe/stripe.did";
import { canisterId, idlFactory } from "../../../../declarations/stripe";

const useStripe = createActorHook<_SERVICE>({
	canisterId: canisterId,
	idlFactory: idlFactory,
});

export default useStripe;
