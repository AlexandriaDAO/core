import { createUseActorHook } from 'ic-use-actor';
import { _SERVICE } from "../../../../declarations/icrc7/icrc7.did";
import { Icrc7Context } from '@/contexts/actors';

const useIcrc7 = createUseActorHook<_SERVICE>(Icrc7Context);

export default useIcrc7