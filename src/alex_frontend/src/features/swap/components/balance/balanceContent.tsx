import React, { useEffect } from "react";
import { ActorSubclass } from "@dfinity/agent";

import AlexBalanceCard from "./alexBalanceCard";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { _SERVICE as _SERVICEALEX } from '../../../../../../declarations/ALEX/ALEX.did'
import { _SERVICE as _SERVICELBRY } from '../../../../../../declarations/LBRY/LBRY.did';

import getAccountAlexBalance from "../../thunks/alexIcrc/getAccountAlexBalance";
import LbryBalanceCard from "./lbryBalanceCard";
import getLbryBalance from "../../thunks/lbryIcrc/getLbryBalance";

interface BalanceContentProps {
    actorAlex: ActorSubclass<_SERVICEALEX>;
    actorLbry: ActorSubclass<_SERVICELBRY>;
    isAuthenticated: boolean;

}
const BalanceContent: React.FC<BalanceContentProps> = ({ actorAlex, actorLbry, isAuthenticated }) => {
    const dispatch = useAppDispatch();
    const auth = useAppSelector((state) => state.auth);


    useEffect(() => {
        if (isAuthenticated === true) {
            dispatch(getAccountAlexBalance({ actor: actorAlex, account: auth.user }))
        }
    }, [auth.user, isAuthenticated])


    useEffect(() => {
        if (isAuthenticated === true) {
            dispatch(getLbryBalance({ actorLbry, account: auth.user }))
        }
    }, [auth.user, isAuthenticated])


    return (
        <>
            <div>
                <div className='mb-5 2xl:mb-10 xl:mb-7 lg:mb-7 md:mb-6 sm:mb-5'>
                    <h3 className="text-tabsheading 2xl:text-xxltabsheading xl:text-xltabsheading lg:text-lgtabsheading md:text-mdtabsheading sm:text-smtabsheading font-bold">Balance</h3>
                </div>
                <div className="flex">
                    <AlexBalanceCard />
                    <LbryBalanceCard />
                </div>
            </div>
        </>
    );
};
export default BalanceContent;
