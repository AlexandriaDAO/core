import { createActorHook } from "ic-use-actor";
import { _SERVICE } from "../../../../declarations/icp_swap_factory/icp_swap_factory.did";
import { idlFactory } from "../../../../declarations/icp_swap_factory";

// reference authUtils.ts icp_swap_factory_canister_id
const useIcpSwapFactory = createActorHook<_SERVICE>({
	canisterId: "ggzvv-5qaaa-aaaag-qck7a-cai",
	idlFactory: idlFactory,
});
export default useIcpSwapFactory;
