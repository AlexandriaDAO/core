import { createUseActorHook } from 'ic-use-actor';
import { _SERVICE } from "../../../../declarations/user/user.did";
import { UserContext } from '@/contexts/actors';

const useUser = createUseActorHook<_SERVICE>(UserContext);

export default useUser