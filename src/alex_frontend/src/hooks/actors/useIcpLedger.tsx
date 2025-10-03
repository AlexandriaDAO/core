import { createActorHook } from "ic-use-actor";
import { _SERVICE } from "../../../../declarations/icp_ledger_canister/icp_ledger_canister.did";
import {
	canisterId,
	idlFactory,
} from "../../../../declarations/icp_ledger_canister";

const useIcpLedger = createActorHook<_SERVICE>({
	canisterId: canisterId,
	idlFactory: idlFactory,
});

export default useIcpLedger;
