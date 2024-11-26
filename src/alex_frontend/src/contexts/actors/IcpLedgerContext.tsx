import { createActorContext } from "ic-use-actor";

import { _SERVICE } from "../../../../declarations/icp_ledger_canister/icp_ledger_canister.did";

const IcpLedgerContext = createActorContext<_SERVICE>();

export default IcpLedgerContext;