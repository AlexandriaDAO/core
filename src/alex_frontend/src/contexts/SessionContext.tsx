import { createContext } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { ActorSubclass } from "@dfinity/agent";
import { alex_backend } from '../../../declarations/alex_backend';
import { _SERVICE } from '../../../declarations/alex_backend/alex_backend.did';
import MeiliSearch, { Index } from 'meilisearch';


interface SessionContextProps {
	actor: ActorSubclass<_SERVICE>;
	authClient: AuthClient | undefined;
	meiliClient: MeiliSearch | undefined;
	meiliIndex: Index | undefined;
}

const SessionContext = createContext<SessionContextProps>({
	actor: alex_backend,
	authClient: undefined,
	meiliClient: undefined,
	meiliIndex: undefined,
});

export default SessionContext