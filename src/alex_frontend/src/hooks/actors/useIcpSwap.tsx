import { createActorHook } from "ic-use-actor";
import { _SERVICE } from "../../../../declarations/icp_swap/icp_swap.did";
import { canisterId, idlFactory } from "../../../../declarations/icp_swap";

const useIcpSwap = createActorHook<_SERVICE>({
	canisterId: canisterId,
	idlFactory: idlFactory,
});
export default useIcpSwap;
