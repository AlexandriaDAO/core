import { createUseActorHook } from 'ic-use-actor';
import { _SERVICE } from "../../../../declarations/tokenomics/tokenomics.did";
import { TokenomicsContext } from '@/contexts/actors';

const useTokenomics = createUseActorHook<_SERVICE>(TokenomicsContext);

export default useTokenomics