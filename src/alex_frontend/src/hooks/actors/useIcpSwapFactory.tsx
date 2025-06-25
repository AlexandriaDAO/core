import { createUseActorHook } from 'ic-use-actor';
import { _SERVICE } from "../../../../declarations/icp_swap_factory";
import { IcpSwapFactoryContext } from '@/contexts/actors';

const useIcpSwapFactory = createUseActorHook<_SERVICE>(IcpSwapFactoryContext);

export default useIcpSwapFactory;