import { useEffect } from "react";
import login from "@/features/login/thunks/login";
import { useUser } from "@/hooks/actors";
import { useIdentity } from "@/lib/ic-use-identity";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";

export default function UserProvider(){
    const dispatch = useAppDispatch();
    const {identity} = useIdentity();

    useEffect(()=>{
        if(!identity) return;
        useUser.ensureInitialized().then((actor)=>{
            if(!actor) return;
            dispatch(login(actor));
        })
    }, [identity]);

	return null
}
