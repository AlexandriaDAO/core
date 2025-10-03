import { createActorHook } from "ic-use-actor";
import { _SERVICE } from "../../../../declarations/alex_wallet/alex_wallet.did";
import { canisterId, idlFactory } from "../../../../declarations/alex_wallet";

const useAlexWallet = createActorHook<_SERVICE>({
	canisterId: canisterId,
	idlFactory: idlFactory,
});

export default useAlexWallet;
