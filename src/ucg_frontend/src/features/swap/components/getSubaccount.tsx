import React, { useEffect } from "react";
import { useAppDispatch } from '../../../store/hooks/useAppDispatch';
import { useAppSelector } from "../../../store/hooks/useAppSelector";
import { ActorSubclass } from "@dfinity/agent";

import getSubaccount from "../thunks/getSubaccount";
import { ImSpinner8 } from "react-icons/im";
import { _SERVICE as _SERVICESWAP} from '../../../../../declarations/icp_swap/icp_swap.did';
interface LbryRatioProps {
    actorSwap: ActorSubclass<_SERVICESWAP>;
  }
  
const GetSubaccount: React.FC<LbryRatioProps>  = ({actorSwap}) => {
    const dispatch = useAppDispatch();
    const swap = useAppSelector((state) => state.swap);
    useEffect(() => {
        dispatch(getSubaccount({actor: actorSwap}));
    }, [])

    return (<div className="account-wrapper">
        {swap.loading ? (
            <div className="flex gap-1 items-center text-[#828282]">
                <span className="text-base font-normal font-roboto-condensed tracking-wider">
                    Processing
                </span>
                <ImSpinner8 size={18} className="animate animate-spin text-white" />
            </div>) : (<div className="subaccount-wrapper flex justify-between mb-2">
                <h3>Subaccount</h3>
                <p className="swap-account">{swap?.subaccount}</p>
            </div>)
        }

    </div>);
};
export default GetSubaccount;
