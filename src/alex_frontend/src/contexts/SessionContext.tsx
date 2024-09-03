import { createContext } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { ActorSubclass } from "@dfinity/agent";
import MeiliSearch, { Index } from 'meilisearch';
import { alex_backend } from '../../../declarations/alex_backend';
import { alex_librarian } from '../../../declarations/alex_librarian';
import { createActor, canisterId } from '../../../declarations/alex_wallet';
import { vetkd } from '../../../declarations/vetkd';

import { icp_swap } from '../../../declarations/icp_swap';
import { icp_ledger_canister } from '../../../declarations/icp_ledger_canister';
import { tokenomics } from '../../../declarations/tokenomics';
import { LBRY } from '../../../declarations/LBRY';
import { ALEX } from '../../../declarations/ALEX'
import { _SERVICE } from '../../../declarations/alex_backend/alex_backend.did';
import { _SERVICE as _SERVICE_ALEX_LIBRARIAN} from '../../../declarations/alex_librarian/alex_librarian.did';
import { _SERVICE as _SERVICE_ALEX_WALLET} from '../../../declarations/alex_wallet/alex_wallet.did';
import { _SERVICE as _SERVICE_VETKD} from '../../../declarations/vetkd/vetkd.did';
import { _SERVICE as _SERVICESWAP } from '../../../declarations/icp_swap/icp_swap.did';
import { _SERVICE as _SERVICEICPLEDGER } from '../../../declarations/icp_ledger_canister/icp_ledger_canister.did';
import { _SERVICE as _SERVICETOKENOMICS } from '../../../declarations/tokenomics/tokenomics.did';
import { _SERVICE as _SERVICELBRY } from '../../../declarations/LBRY/LBRY.did';
import { _SERVICE as _SERVICEALEX } from "../../../declarations/ALEX/ALEX.did"

interface SessionContextProps {
	actor: ActorSubclass<_SERVICE>;
	actorAlexLibrarian: ActorSubclass<_SERVICE_ALEX_LIBRARIAN>;
	actorAlexWallet: ActorSubclass<_SERVICE_ALEX_WALLET>;
	actorVetkd: ActorSubclass<_SERVICE_VETKD>;
	actorSwap: ActorSubclass<_SERVICESWAP>;
	actorIcpLedger: ActorSubclass<_SERVICEICPLEDGER>;
	actorTokenomics: ActorSubclass<_SERVICETOKENOMICS>;
	actorLbry: ActorSubclass<_SERVICELBRY>;
	actorAlex: ActorSubclass<_SERVICEALEX>;
	authClient: AuthClient | undefined;
	meiliClient: MeiliSearch | undefined;
	meiliIndex: Index | undefined;
}

const SessionContext = createContext<SessionContextProps>({
	actor: alex_backend,
	actorAlexLibrarian: alex_librarian,
	actorAlexWallet: createActor(canisterId),
	actorVetkd: vetkd,
	actorSwap: icp_swap,
	actorIcpLedger: icp_ledger_canister,
	actorTokenomics: tokenomics,
	actorLbry: LBRY,
	actorAlex: ALEX,
	authClient: undefined,
	meiliClient: undefined,
	meiliIndex: undefined,
});

export default SessionContext