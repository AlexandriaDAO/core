import { createUseActorHook } from 'ic-use-actor';
import { _SERVICE } from "../../../../declarations/alex_backend/alex_backend.did";
import { AlexBackendContext } from '@/contexts/actors';

const useAlexBackend = createUseActorHook<_SERVICE>(AlexBackendContext);

export default useAlexBackend