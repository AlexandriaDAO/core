import { createContext } from 'react';

export type Authenticator = 'II' | 'ETH' | 'SOL';

interface AuthContextProps {
	provider: Authenticator;
	setProvider: (provider: Authenticator) => void;
}

const AuthContext = createContext<AuthContextProps>({
	provider: 'II',
	setProvider: () => {},
});

export default AuthContext