import { useEffect } from "react";
import { useInternetIdentity } from "ic-use-internet-identity";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setUser } from "@/features/auth/authSlice";
import { useUser } from "@/hooks/actors";
import login from "@/features/login/thunks/login";
import { useAppSelector } from "@/store/hooks/useAppSelector";

const useInitAuth = () => {
    const {identity} = useInternetIdentity();
    const {actor} = useUser();

    const dispatch = useAppDispatch();
    const {user} = useAppSelector(state=>state.auth);


    // Handle auth state changes
    useEffect(()=>{
        if(!actor) return;

        if(!identity){
            dispatch(setUser(null));
            return;
        }

        if(!user){
            dispatch(login(actor))
        }

    }, [actor, identity, user, dispatch,]);
};

export default useInitAuth;