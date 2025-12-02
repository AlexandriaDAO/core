import { createActorHook } from "ic-use-actor";

import type { _SERVICE } from "../../../../declarations/kairos/kairos.did";

import {
	canisterId,
	idlFactory,
} from "../../../../declarations/kairos";

const useKairos = createActorHook<_SERVICE>({
	canisterId: canisterId,
	idlFactory: idlFactory,
});

export default useKairos;
