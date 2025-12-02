import { createActorHook } from "ic-use-actor";
import { _SERVICE } from "../../../../declarations/user/user.did";
import { canisterId, idlFactory } from "../../../../declarations/user";

const useUser = createActorHook<_SERVICE>({
	canisterId: canisterId,
	idlFactory: idlFactory,
});

export default useUser;
