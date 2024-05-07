import { createContext } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { ActorSubclass } from "@dfinity/agent";
import { ugd_backend } from '../../../declarations/ugd_backend';
import { _SERVICE } from '../../../declarations/ugd_backend/ugd_backend.did';
import MeiliSearch, { Index } from 'meilisearch';


interface SessionContextProps {
	actor: ActorSubclass<_SERVICE>;
	authClient: AuthClient | undefined;
	meiliClient: MeiliSearch | undefined;
	meiliIndex: Index | undefined;
}

const SessionContext = createContext<SessionContextProps>({
	actor: ugd_backend,
	authClient: undefined,
	meiliClient: undefined,
	meiliIndex: undefined,
});

export default SessionContext