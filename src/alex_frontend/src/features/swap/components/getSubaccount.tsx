import React, { useEffect } from "react";
import { useAppDispatch } from '../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../store/hooks/useAppSelector";
import { ActorSubclass } from "@dfinity/agent";

import getSubaccount from "../thunks/getSubaccount";
import getLbryBalance from "../thunks/getLbryBalance";

import { ImSpinner8 } from "react-icons/im";
import { _SERVICE as _SERVICESWAP } from '../../../../../declarations/icp_swap/icp_swap.did';
import { _SERVICE as _SERVICELBRY } from '../../../../../declarations/LBRY/LBRY.did';
interface LbryRatioProps {
    actorSwap: ActorSubclass<_SERVICESWAP>;
    actorLbry: ActorSubclass<_SERVICELBRY>;
}

const GetSubaccount: React.FC<LbryRatioProps> = ({ actorSwap, actorLbry }) => {
    const dispatch = useAppDispatch();
    const swap = useAppSelector((state) => state.swap);
    const auth = useAppSelector((state) => state.auth);

    useEffect(() => {
        dispatch(getSubaccount({ actor: actorSwap }));
    }, [])

    useEffect(() => {
        dispatch(getLbryBalance({ actorLbry, account: auth.user }))
    }, [swap.subaccount,swap.success])
    return (<div className="account-wrapper">
        LBRY Balance :{swap.lbryBalance}
    </div>);
};
export default GetSubaccount;
