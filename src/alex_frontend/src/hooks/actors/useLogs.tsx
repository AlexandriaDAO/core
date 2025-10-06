import { createActorHook } from "ic-use-actor";
import { _SERVICE } from "../../../../declarations/logs/logs.did";
import { canisterId, idlFactory } from "../../../../declarations/logs";

const useLogs = createActorHook<_SERVICE>({
	canisterId: canisterId,
	idlFactory: idlFactory,
});

export default useLogs;
