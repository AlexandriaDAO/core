import { useInternetIdentity } from 'ic-use-internet-identity';
// import { useSiweIdentity } from 'ic-use-siwe-identity';
import { AnonymousIdentity } from '@dfinity/agent';
import useAuth from '@/hooks/useAuth';
// import { useSiwsIdentity } from 'ic-use-siws-identity';
import { useSiwoIdentity } from 'ic-use-siwo-identity';

export function useIdentity() {
    const { provider } = useAuth();

    if (provider === 'II' || provider === 'NFID') {
        return useInternetIdentity();
    }

    // if (provider === 'ETH') {
    //     return useSiweIdentity();
    // }

    // if (provider === 'SOL') {
    //     return useSiwsIdentity();
    // }

    if (provider === 'OISY') {
        return useSiwoIdentity();
    }


    return {
        identity: new AnonymousIdentity(),
        clear: () => {},
        login: () => {},
        isInitializing: false,
        isLoggingIn: false
    };
}