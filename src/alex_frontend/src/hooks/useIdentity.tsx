import { useInternetIdentity } from 'ic-use-internet-identity';
import { useNfidIdentity } from 'ic-use-nfid-identity';
// import { useSiweIdentity } from 'ic-use-siwe-identity';
import { AnonymousIdentity } from '@dfinity/agent';
import useAuth from '@/hooks/useAuth';
// import { useSiwsIdentity } from 'ic-use-siws-identity';
import { useSiwoIdentity } from 'ic-use-siwo-identity';

export function useIdentity() {
    const { provider } = useAuth();

    const {identity: iiIdentity, isInitializing: iiIsInitializing, isLoggingIn: iiIsLoggingIn, clear: iiClear, login: iiLogin} = useInternetIdentity();
    const {identity: nfidIdentity, isInitializing: nfidIsInitializing, isLoggingIn: nfidIsLoggingIn, clear: nfidClear, login: nfidLogin} = useNfidIdentity();
    const {identity: oisyIdentity, isInitializing: oisyIsInitializing, isLoggingIn: oisyIsLoggingIn, clear: oisyClear, login: oisyLogin} = useSiwoIdentity();

    if (provider === 'II') {
        return {
            identity: iiIdentity,
            isInitializing: iiIsInitializing,
            isLoggingIn: iiIsLoggingIn,
            clear: iiClear,
            login: iiLogin
        };
    }

    if (provider === 'NFID') {
        return {
            identity: nfidIdentity,
            isInitializing: nfidIsInitializing,
            isLoggingIn: nfidIsLoggingIn,
            clear: nfidClear,
            login: nfidLogin
        };
    }

    // if (provider === 'ETH') {
    //     return useSiweIdentity();
    // }

    // if (provider === 'SOL') {
    //     return useSiwsIdentity();
    // }

    if (provider === 'OISY') {
        return {
            identity: oisyIdentity,
            isInitializing: oisyIsInitializing,
            isLoggingIn: oisyIsLoggingIn,
            clear: oisyClear,
            login: oisyLogin
        };
    }


    return {
        identity: new AnonymousIdentity(),
        isInitializing: false,
        isLoggingIn: false,
        clear: () => {},
        login: () => {},
    };
}