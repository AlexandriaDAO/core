import React, { useEffect } from "react";

import AlexBalanceCard from "./alexBalanceCard";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";

import getAccountAlexBalance from "../../thunks/alexIcrc/getAccountAlexBalance";
import LbryBalanceCard from "./lbryBalanceCard";
import getLbryBalance from "../../thunks/lbryIcrc/getLbryBalance";
import { useAlex, useLbry } from "@/hooks/actors";

const BalanceContent: React.FC = () => {
    const dispatch = useAppDispatch();
    const {user} = useAppSelector((state) => state.auth);
    const {actor: alexActor} = useAlex();
    const {actor: lbryActor} = useLbry();

    useEffect(() => {
        if (!user || !alexActor || !lbryActor) return;

        dispatch(getAccountAlexBalance({actor: alexActor, account: user.principal}))
        dispatch(getLbryBalance({actor: lbryActor, account: user.principal}))
    }, [user, alexActor, lbryActor])


    return (
        <>
            <div>
                <div className='mb-5 2xl:mb-10 xl:mb-7 lg:mb-7 md:mb-6 sm:mb-5'>
                    <h3 className="text-tabsheading 2xl:text-xxltabsheading xl:text-xltabsheading lg:text-lgtabsheading md:text-mdtabsheading sm:text-smtabsheading font-bold">Balance</h3>
                </div>
                <div className="flex md:flex-row flex-col">
                    <AlexBalanceCard />
                    <LbryBalanceCard />
                </div>
            </div>
        </>
    );
};
export default BalanceContent;
