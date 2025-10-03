import { createActorHook } from "ic-use-actor";

import type { _SERVICE } from "../../../../declarations/authentication/authentication.did";

import {
	canisterId,
	idlFactory,
} from "../../../../declarations/authentication";

const useAuthentication = createActorHook<_SERVICE>({
	canisterId: canisterId,
	idlFactory: idlFactory,
});

export default useAuthentication;