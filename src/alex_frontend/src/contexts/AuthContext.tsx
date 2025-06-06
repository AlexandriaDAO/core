import { createContext } from 'react';
import { Identity } from '@dfinity/agent';
import { DelegationIdentity } from '@dfinity/identity';

export type Authenticator = 'II' | 'NFID' | 'OISY' | 'ETH' | 'SOL';

export interface AuthContextProps {
	provider: Authenticator;
	setProvider: (provider: Authenticator) => void;
	identity: Identity | DelegationIdentity | undefined;
	isInitializing: boolean;
	isLoggingIn: boolean;
	clear: () => void;
	login: () => void;
}

const AuthContext = createContext<AuthContextProps>({
	provider: 'II',
	setProvider: () => {},
	identity: undefined,
	isInitializing: false,
	isLoggingIn: false,
	clear: () => {},
	login: () => {},
});

export default AuthContext