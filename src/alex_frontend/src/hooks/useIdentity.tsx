import { useInternetIdentity } from 'ic-use-internet-identity';
import { useSiweIdentity } from 'ic-use-siwe-identity';
import { AnonymousIdentity } from '@dfinity/agent';
import useAuth from '@/hooks/useAuth';
import { useSiwsIdentity } from 'ic-use-siws-identity';


export function useIdentity() {
    const { provider } = useAuth();

    if (provider === 'II') {
        return useInternetIdentity();
    }

    if (provider === 'ETH') {
        return useSiweIdentity();
    }

    if (provider === 'SOL') {
        return useSiwsIdentity();
    }

    return {
        identity: new AnonymousIdentity(),
        clear: () => {},
        login: () => {},
        isInitializing: false,
        isLoggingIn: false
    };
}