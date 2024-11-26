import { createUseActorHook } from 'ic-use-actor';
import { _SERVICE } from "../../../../declarations/ALEX/ALEX.did";
import { AlexContext } from '@/contexts/actors';

const useAlex = createUseActorHook<_SERVICE>(AlexContext);

export default useAlex