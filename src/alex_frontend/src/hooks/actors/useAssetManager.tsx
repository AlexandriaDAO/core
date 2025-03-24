import { createUseActorHook } from 'ic-use-actor';
import { _SERVICE } from "../../../../declarations/asset_manager/asset_manager.did";
import { AssetManagerContext } from '@/contexts/actors';

const useAssetManager = createUseActorHook<_SERVICE>(AssetManagerContext);

export default useAssetManager