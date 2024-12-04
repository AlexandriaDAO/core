import { createUseActorHook } from 'ic-use-actor';
import { _SERVICE } from "../../../../declarations/emporium/emporium.did";
import { EmporiumContext } from '@/contexts/actors';

const useEmporium = createUseActorHook<_SERVICE>(EmporiumContext);

export default useEmporium