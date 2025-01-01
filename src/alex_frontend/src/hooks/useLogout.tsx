import { useIdentity } from './useIdentity';

export function useLogout() {
    const {clear} = useIdentity();

    const logout = async ()=>{
        await clear();

        // navigate('/')

        // cached identity issue, force refresh
        window.location.href = '/'
    }

    return logout
}