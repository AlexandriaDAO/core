import { createUseActorHook } from 'ic-use-actor';
import { _SERVICE } from "../../../../declarations/lexigraph/lexigraph.did";
import { LexigraphContext } from '@/contexts/actors';

const useLexigraph = createUseActorHook<_SERVICE>(LexigraphContext);

export default useLexigraph;