import { createUseActorHook } from 'ic-use-actor';
import { _SERVICE } from "../../../../declarations/icp_ledger_canister/icp_ledger_canister.did";
import { IcpLedgerContext } from '@/contexts/actors';

const useIcpLedger = createUseActorHook<_SERVICE>(IcpLedgerContext);

export default useIcpLedger