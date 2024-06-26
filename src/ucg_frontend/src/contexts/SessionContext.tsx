import { createContext } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { ActorSubclass } from "@dfinity/agent";
import { ucg_backend } from '../../../declarations/ucg_backend';
import { _SERVICE } from '../../../declarations/ucg_backend/ucg_backend.did';
import MeiliSearch, { Index } from 'meilisearch';


interface SessionContextProps {
	actor: ActorSubclass<_SERVICE>;
	authClient: AuthClient | undefined;
	meiliClient: MeiliSearch | undefined;
	meiliIndex: Index | undefined;
}

const SessionContext = createContext<SessionContextProps>({
	actor: ucg_backend,
	authClient: undefined,
	meiliClient: undefined,
	meiliIndex: undefined,
});

export default SessionContext