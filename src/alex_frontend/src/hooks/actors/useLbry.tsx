import { createActorHook } from "ic-use-actor";
import { _SERVICE } from "../../../../declarations/LBRY/LBRY.did";
import {
	canisterId,
	idlFactory,
} from "../../../../declarations/LBRY";

const useLbry = createActorHook<_SERVICE>({
	canisterId: canisterId,
	idlFactory: idlFactory,
});

export default useLbry;
