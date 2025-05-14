import { useIdentity } from './useIdentity';

export function useLogout() {
    const {clear} = useIdentity();

    const logout = async ()=>{
        await clear();

        window.location.href = "/";
    }

    return logout
}