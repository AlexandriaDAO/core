import React, { useEffect } from "react";
import { useAppDispatch } from '../../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../../store/hooks/useAppSelector";

import { _SERVICE as _SERVICESWAP } from '../../../../../../declarations/icp_swap/icp_swap.did';
import { _SERVICE as _SERVICEALEX} from '../../../../../../declarations/ALEX/ALEX.did' 
import getAccountAlexBalance from "../../thunks/alexIcrc/getAccountAlexBalance";

const GetAlexBal = (user: string) => {
    const dispatch = useAppDispatch();
    const alex = useAppSelector((state) => state.alex);
    const auth = useAppSelector((state) => state.auth);
    const swap = useAppSelector((state) => state.swap);

    useEffect(() => {
        if(!auth.user) return;
        dispatch(getAccountAlexBalance(auth.user.principal))
    }, [auth.user])
    useEffect(() => {
        if(!auth.user) return;
        if (swap.successStake === true||swap.unstakeSuccess === true||swap.burnSuccess === true ||swap.successClaimReward===true) {
            dispatch(getAccountAlexBalance(auth.user.principal))
        }
    }, [auth.user, swap])
    return (<div className="account-wrapper">
        Alex Balance :{alex.alexBal}
    </div>);
};
export default GetAlexBal;
