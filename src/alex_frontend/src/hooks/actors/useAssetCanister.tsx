import { createUseActorHook } from 'ic-use-actor';
import { _SERVICE } from "../../../../asset_canister/asset_canister.did";
import { AssetCanisterContext } from '@/contexts/actors';

const useAssetCanister = createUseActorHook<_SERVICE>(AssetCanisterContext);

export default useAssetCanister