import { createUseActorHook } from 'ic-use-actor';
import { _SERVICE } from "../../../../declarations/logs/logs.did";
import { LogsContext } from '@/contexts/actors';

const useLogs = createUseActorHook<_SERVICE>(LogsContext);

export default useLogs;