import { createUseActorHook } from 'ic-use-actor';
import { _SERVICE } from "../../../../declarations/perpetua/perpetua.did";
import { PerpetuaContext } from '@/contexts/actors';

const usePerpetua = createUseActorHook<_SERVICE>(PerpetuaContext);

export default usePerpetua;