import React, { useEffect } from "react";
import { useAppDispatch } from '../../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../../store/hooks/useAppSelector";
import getAccountAlexBalance from "../../thunks/alexIcrc/getAccountAlexBalance";

import { useAlex } from "@/hooks/actors";

const GetAlexBal = (user: string) => {
    const {actor: alexActor} = useAlex();

    const dispatch = useAppDispatch();
    const alex = useAppSelector((state) => state.alex);
    const auth = useAppSelector((state) => state.auth);
    const swap = useAppSelector((state) => state.swap);

    useEffect(() => {
        if(!auth.user || !alexActor) return;
        dispatch(getAccountAlexBalance({actor: alexActor, account: auth.user.principal}))
    }, [auth.user])
    useEffect(() => {
        if(!auth.user || !alexActor) return;
        if (swap.successStake === true||swap.unstakeSuccess === true||swap.burnSuccess === true ||swap.successClaimReward===true) {
            dispatch(getAccountAlexBalance({actor: alexActor, account: auth.user.principal}))
        }
    }, [auth.user, swap])
    return (<div className="account-wrapper">
        Alex Balance :{alex.alexBal}
    </div>);
};
export default GetAlexBal;
