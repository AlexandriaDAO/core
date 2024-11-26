import { createUseActorHook } from 'ic-use-actor';
import { _SERVICE } from "../../../../declarations/icp_swap/icp_swap.did";
import { IcpSwapContext } from '@/contexts/actors';

const useIcpSwap = createUseActorHook<_SERVICE>(IcpSwapContext);

export default useIcpSwap