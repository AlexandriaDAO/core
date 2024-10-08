import React, { useEffect, useState } from "react";
import { ActorSubclass } from "@dfinity/agent";

import { useAppSelector } from "@/store/hooks/useAppSelector";
import { _SERVICE as _SERVICESWAP } from "../../../../../../declarations/icp_swap/icp_swap.did";
import { _SERVICE as _SERVICEICPLEDGER } from "../../../../../../declarations/icp_ledger_canister/icp_ledger_canister.did";

import Auth from "@/features/auth";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import getIcpBal from "@/features/icp-ledger/thunks/getIcpBal";
import CopyHelper from "../copyHelper";

const AccountCards: React.FC = () => {
    const dispatch = useAppDispatch();
    const {user} = useAppSelector((state) => state.auth);
    const swap = useAppSelector((state) => state.swap);
    const icpLedger = useAppSelector((state) => state.icpLedger);
    const [formattedPrincipal, setFormattedPrincipal] = useState("");

    // icp ledger
    useEffect(() => {
        if (user !== '') {
            dispatch( getIcpBal(user));
        }
    }, [user]);
    useEffect(() => {
        if (
            swap.successClaimReward === true ||
            swap.swapSuccess === true ||
            swap.burnSuccess === true ||
            swap.transferSuccess === true ||
            icpLedger.transferSuccess === true
        ) {
            dispatch( getIcpBal(user) );
        }
    }, [swap, icpLedger]);

    //style
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1000) {
                setFormattedPrincipal(
                    user.slice(0, 3) + "..." + user.slice(-3)
                );
            } else {
                setFormattedPrincipal(
                    user.slice(0, 5) + "..." + user.slice(-20)
                );
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, [user]);

    return (
        <>
            <div className="grid grid-cols-1 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 mb-3 2xl:mb-12 xl:mb-10 lg:mb-7 md:mb-6 sm:mb-5">
                <div className="bg-balancebox text-white py-5 px-5 me-0 2xl:me-3 xl:me-3 lg:me-3 md:me-3 sm:me-0 rounded-3xl xxl:py-5 xxl:px-5 mb-3 2xl:mb-0 xl:mb-0 lg:mb-0 md:mb-0 sm:mb-3">
                    <h4 className="text-2xl xl:text-xl font-medium mb-3  2xl:mb-3  xl:mb-3">
                        Principal Account
                    </h4>

                    {user !== '' ? (
                        <>
                            <div className="mb-20 xxl:mb-20">
                                <div className="flex justify-between mb-3 xxl:mb-3">
                                    <div>
                                        <strong className="text-xl font-medium me-3 xxl:text-xl xxl:me-3">
                                            {formattedPrincipal}
                                        </strong>
                                        <span className="text-base text-multycolor font-medium xxl:text-base">
                                            (Connected)
                                        </span>
                                    </div>
                                    <CopyHelper account={user} />
                                </div>
                            </div>
                            <h4 className="text-2xl 2xl:text-2xl font-medium mb-3">
                                Estimated Balance
                            </h4>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-2xl 2xl:text-2xl font-medium mb-3 ">
                                        ≈ ICP {icpLedger?.accountBalance}
                                    </h4>
                                </div>
                                <div className="mb-3 xxl:mb-3">
                                    <h4 className="text-2xl 2xl:text-2xl font-medium mb-3 text-multygray">
                                        ≈ $ 10
                                    </h4>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="mb-20 xxl:mb-20">
                            <div className="flex justify-between mb-3 xxl:mb-3 text-white white-auth-btn">
                                <Auth />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
export default AccountCards;
