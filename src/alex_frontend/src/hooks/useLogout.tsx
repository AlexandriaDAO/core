import { useIdentity } from './useIdentity';
import { useNavigate } from "react-router";

export function useLogout() {
    const {clear} = useIdentity();
    const navigate = useNavigate()

    const logout = async ()=>{
        await clear();

        navigate('/')
    }

    return logout
}