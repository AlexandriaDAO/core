import { createUseActorHook } from 'ic-use-actor';
import { _SERVICE } from "../../../../declarations/icp_swap_factory/icp_swap_factory.did";
import { IcpSwapFactoryContext } from '@/contexts/actors';

const useIcpSwapFactory = createUseActorHook<_SERVICE>(IcpSwapFactoryContext);

export default useIcpSwapFactory;