import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { useIdentity } from './useIdentity';
import { setUser } from '@/features/auth/authSlice';

export function useLogout() {
    const dispatch = useAppDispatch();
    const {clear} = useIdentity();

    const logout = async ()=>{
        clear();

        dispatch(setUser(null));

        window.location.href = "/";
    }

    return logout
}