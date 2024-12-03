import { useInternetIdentity } from 'ic-use-internet-identity';

export function useLogout() {
    const {clear} = useInternetIdentity();

    const logout = async ()=>{
        await clear();

        // navigate('/')

        // cached identity issue, force refresh
        window.location.href = '/'
    }

    return logout
}