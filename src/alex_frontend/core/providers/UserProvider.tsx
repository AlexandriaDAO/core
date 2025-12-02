import { useEffect } from "react";
import getCanisters from "@/features/auth/thunks/getCanisters";
import login from "@/features/login/thunks/login";
import { useUser } from "@/hooks/actors";
import { useAssetManager } from "@/hooks/actors";
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

     useEffect(()=>{
        useAssetManager.ensureInitialized().then((actor)=>{
            if(!actor) return;
            dispatch(getCanisters({actor}));
        })
    }, []);

	return null
}