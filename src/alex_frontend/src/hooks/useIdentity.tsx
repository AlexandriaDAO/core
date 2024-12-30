import { useInternetIdentity } from 'ic-use-internet-identity';
import { useSiweIdentity } from 'ic-use-siwe-identity';
import { AnonymousIdentity } from '@dfinity/agent';
import useAuth from '@/hooks/useAuth';


export function useIdentity() {
    const { provider } = useAuth();

    if (provider === 'II') {
        return useInternetIdentity();
    }

    if (provider === 'ETH') {
        return useSiweIdentity();
    }

    return {
        identity: new AnonymousIdentity(),
        clear: () => {},
        login: () => {},
        isInitializing: false,
        isLoggingIn: false
    };
}