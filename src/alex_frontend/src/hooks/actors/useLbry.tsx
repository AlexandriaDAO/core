import { createUseActorHook } from 'ic-use-actor';
import { _SERVICE } from "../../../../declarations/LBRY/LBRY.did";
import { LbryContext } from '@/contexts/actors';

const useLbry = createUseActorHook<_SERVICE>(LbryContext);

export default useLbry