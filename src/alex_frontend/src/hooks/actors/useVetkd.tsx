import { createUseActorHook } from 'ic-use-actor';
import { _SERVICE } from "../../../../declarations/vetkd/vetkd.did";
import { VetkdContext } from '@/contexts/actors';

const useVetkd = createUseActorHook<_SERVICE>(VetkdContext);

export default useVetkd