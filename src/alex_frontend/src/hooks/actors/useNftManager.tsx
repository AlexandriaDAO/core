import { createUseActorHook } from 'ic-use-actor';
import { _SERVICE } from "../../../../declarations/nft_manager/nft_manager.did";
import { NftManagerContext } from '@/contexts/actors';

const useNftManager = createUseActorHook<_SERVICE>(NftManagerContext);

export default useNftManager