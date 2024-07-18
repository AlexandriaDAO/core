import { createContext } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { ActorSubclass } from "@dfinity/agent";
import MeiliSearch, { Index } from 'meilisearch';
import { ucg_backend } from '../../../declarations/ucg_backend';
import { icp_swap } from '../../../declarations/icp_swap';
import { icp_ledger_canister } from '../../../declarations/icp_ledger_canister';
import { tokenomics } from '../../../declarations/tokenomics';
import { LBRY } from '../../../declarations/LBRY';
import { _SERVICE } from '../../../declarations/ucg_backend/ucg_backend.did';
import { _SERVICE as _SERVICESWAP } from '../../../declarations/icp_swap/icp_swap.did';
import { _SERVICE as _SERVICEICPLEDGER } from '../../../declarations/icp_ledger_canister/icp_ledger_canister.did';
import { _SERVICE as _SERVICETOKENOMICS } from '../../../declarations/tokenomics/tokenomics.did';
import { _SERVICE as _SERVICELBRY } from '../../../declarations/LBRY/LBRY.did';


interface SessionContextProps {
	actor: ActorSubclass<_SERVICE>;
	actorSwap: ActorSubclass<_SERVICESWAP>;
	actorIcpLedger: ActorSubclass<_SERVICEICPLEDGER>;
	actorTokenomics: ActorSubclass<_SERVICETOKENOMICS>;
	actorLbry: ActorSubclass<_SERVICELBRY>
	authClient: AuthClient | undefined;
	meiliClient: MeiliSearch | undefined;
	meiliIndex: Index | undefined;
}

const SessionContext = createContext<SessionContextProps>({
	actor: ucg_backend,
	actorSwap: icp_swap,
	actorIcpLedger: icp_ledger_canister,
	actorTokenomics: tokenomics,
	actorLbry: LBRY,
	authClient: undefined,
	meiliClient: undefined,
	meiliIndex: undefined,
});

export default SessionContext