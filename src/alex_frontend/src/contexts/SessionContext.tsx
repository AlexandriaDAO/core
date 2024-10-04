import { createContext } from 'react';
import MeiliSearch, { Index } from 'meilisearch';

interface SessionContextProps {
	meiliClient: MeiliSearch | undefined;
	meiliIndex: Index | undefined;
	checkAuthentication: () => Promise<void>;
}

const SessionContext = createContext<SessionContextProps>({
	meiliClient: undefined,
	meiliIndex: undefined,
	checkAuthentication: async () => {},
});

export default SessionContext