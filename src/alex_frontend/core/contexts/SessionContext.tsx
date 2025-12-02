import { createContext } from 'react';
import MeiliSearch, { Index } from 'meilisearch';

interface SessionContextProps {
	meiliClient: MeiliSearch | undefined;
	meiliIndex: Index | undefined;
}

const SessionContext = createContext<SessionContextProps>({
	meiliClient: undefined,
	meiliIndex: undefined,
});

export default SessionContext