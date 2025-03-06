import React, { useEffect, useState } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { _SERVICE as _SERVICESWAP } from '../../../../../../declarations/icp_swap/icp_swap.did'
import { _SERVICE as _SERVICELBRY } from '../../../../../../declarations/LBRY/LBRY.did';

import { Link } from "react-router";
import { flagHandler } from "../../swapSlice";
import burnLbry from "../../thunks/burnLBRY";
import getLbryBalance from "../../thunks/lbryIcrc/getLbryBalance";
import { LoaderCircle } from "lucide-react";
import getCanisterBal from "@/features/icp-ledger/thunks/getCanisterBal";
import getCanisterArchivedBal from "../../thunks/getCanisterArchivedBal";
import LoadingModal from "../loadingModal";
import SuccessModal from "../successModal";
import ErrorModal from "../errorModal";
import BurnInfo from "./burnInfo";
import calculateMaxBurnAllowed from "./calculateMaxBurnAllowed";
import { Entry } from "@/layouts/parts/Header";

const BurnContent = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const swap = useAppSelector((state) => state.swap);
    const icpLedger = useAppSelector((state) => state.icpLedger);
    const tokenomics = useAppSelector((state) => state.tokenomics);

    const [amountLBRY, setAmountLBRY] = useState(0);
    const [tentativeICP, setTentativeICP] = useState(Number);
    const [tentativeALEX, setTentativeALEX] = useState(Number);
    const [loadingModalV, setLoadingModalV] = useState(false);
    const [successModalV, setSucessModalV] = useState(false);
    const [errorModalV, setErrorModalV] = useState({ flag: false, title: "", message: "" });
    const [maxBurnAllowed, setMaxburnAllowed] = useState(Number);



    const handleSubmit = (event: any) => {
        event.preventDefault();
        if (!user?.principal) return;
        dispatch(burnLbry({ amount: amountLBRY.toString(), userPrincipal: user.principal }));
        setLoadingModalV(true);

    }
    const handleAmountLBRYChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        if (Number(e.target.value) >= 0) {

            setAmountLBRY(Number(e.target.value));
            setTentativeICP((Number(e.target.value) / Number(swap.lbryRatio)) / 2);
            setTentativeALEX(Number(e.target.value) * Number(tokenomics.alexMintRate));
        }
    }
    const handleMaxLbry = () => {
        const userBal = Math.floor(Math.max(0, Number(swap.lbryBalance) - Number(swap.lbryFee))); // Ensure non-negative user balance
        const lbryRatio = Number(swap.lbryRatio);
        const alexMintRate = Number(tokenomics.alexMintRate);

        setAmountLBRY(userBal);
        setTentativeICP(userBal / (lbryRatio * 2));
        setTentativeALEX(userBal * alexMintRate);
    };

    useEffect(() => {
        if (!user) return;
        if (swap.burnSuccess === true) {
            dispatch(flagHandler())
            dispatch(getLbryBalance(user.principal))
            setLoadingModalV(false);
            setSucessModalV(true);
            setMaxburnAllowed(calculateMaxBurnAllowed(swap.lbryRatio, icpLedger.canisterBalance, swap.canisterArchivedBal.canisterArchivedBal, swap.canisterArchivedBal.canisterUnClaimedIcp))
        }
        if (swap.error) {
            dispatch(getLbryBalance(user.principal));
            setLoadingModalV(false);
            setErrorModalV({flag:true,title:swap.error.title,message:swap.error.message});
            dispatch(flagHandler());

        }
    }, [user, swap])

    useEffect(() => {
        if (user) {
            dispatch(getLbryBalance(user.principal));
        }
        dispatch(getCanisterBal());
        dispatch(getCanisterArchivedBal());
    }, [user])


    useEffect(() => {
        setMaxburnAllowed(calculateMaxBurnAllowed(swap.lbryRatio, icpLedger.canisterBalance, swap.canisterArchivedBal.canisterArchivedBal, swap.canisterArchivedBal.canisterUnClaimedIcp))
    }, [swap.canisterArchivedBal, swap.lbryRatio, icpLedger.canisterBalance])
    return (
        <>
            <div>
                <div className='mb-5 2xl:mb-10 xl:mb-7 lg:mb-7 md:mb-6 sm:mb-5'>
                    <h3 className="text-tabsheading 2xl:text-xxltabsheading xl:text-xltabsheading lg:text-lgtabsheading md:text-mdtabsheading sm:text-smtabsheading font-bold">Burn</h3>
                </div>
                <div className='grid grid-cols-1 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 mb-12'>
                    <div className='me-0 2xl:me-3 xl:me-3 lg:me-3 md:me-3 sm:me-0 mb-3 2xl:mb-0 xl:mb-0 lg:mb-3 md:mb-3 sm:mb-3'>
                        <div className='bg-white dark:bg-gray-800 border dark:border-gray-700 py-5 px-5 rounded-borderbox mb-7'>
                            <div className='flex justify-between mb-3'>
                                <h4 className='lg:text-2xl md:text-xl sm:text-lg xs:text-base font-medium text-multygray dark:text-gray-300'>Amount</h4>
                                <input className='lg:text-2xl md:text-xl sm:text-lg xs:text-base font-medium text-darkgray dark:text-gray-200 text-right bg-transparent w-full placeholder-darkgray dark:placeholder-gray-400 focus:outline-none focus:border-transparent' type='integer' value={amountLBRY + ""} defaultValue={0} min={0} onChange={(e) => {
                                    handleAmountLBRYChange(e)
                                }} />
                            </div>
                            <div className='flex justify-between'>
                                <div className='flex items-center'>
                                    <strong className='text-base text-multygray dark:text-gray-300 font-medium me-1'>Balance:<span className='text-darkgray dark:text-gray-200 ms-2'>{swap.lbryBalance} LBRY</span></strong>
                                    <img className='w-4 h-4' src="images/lbry-logo.svg" alt="lbry" />
                                </div>
                                <Link to="" role="button" className='text-[#A7B1D7] dark:text-blue-400 underline text-base font-bold' onClick={() => handleMaxLbry()} >Max</Link>
                            </div>
                        </div>
                        <h5 className='text-xl font-medium mb-4 dark:text-gray-200'>you get</h5>
                        <div className='border dark:border-gray-700 bg-[#efefef] dark:bg-gray-800 py-4 px-5 rounded-full mb-4'>
                            <div className='flex justify-between'>
                                <div className='flex items-center'>
                                    <div className='me-3'>
                                        <img className='w-6 h-6' src="images/8-logo.png" alt="icp" />
                                    </div>
                                    <div>
                                        <h4 className=' lg:text-2xl md:text-xl sm:text-lg xs:text-base font-medium'>ICP</h4>
                                    </div>
                                </div>
                                <h3 className={`text-right  lg:text-2xl md:text-xl sm:text-lg xs:text-base font-medium ${amountLBRY > maxBurnAllowed ? 'text-red-500' : ''}`}>
                                    {tentativeICP.toFixed(4)}
                                </h3>
                            </div>
                        </div>
                        <div className='border dark:border-gray-700 bg-[#efefef] dark:bg-gray-800 py-4 px-5 rounded-full mb-4'>
                            <div className='flex justify-between'>
                                <div className='flex items-center'>
                                    <div className='me-3'>
                                        <img className='w-6 h-6' src="images/alex-logo.svg" alt="alex" />
                                    </div>
                                    <div>
                                        <h4 className=' lg:text-2xl md:text-xl sm:text-lg xs:text-base font-medium'>ALEX</h4>
                                    </div>
                                </div>
                                <h3 className={`text-right  lg:text-2xl md:text-xl sm:text-lg xs:text-base font-medium ${tentativeALEX > 50 ? 'text-red-500' : ''}`}>
                                    {tentativeALEX.toFixed(4)}
                                </h3>
                            </div>
                        </div>
                        {user ? <button
                            type="button"
                            className={`bg-balancebox text-white w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2 mb-4 ${parseInt(amountLBRY.toString()) === 0 ||
                                    swap.loading ||
                                    amountLBRY > maxBurnAllowed ||
                                    tentativeALEX > 50
                                    ? 'text-[#808080] cursor-not-allowed'
                                    : 'bg-balancebox text-white cursor-pointer'
                                }`}
                            style={{
                                backgroundColor: parseInt(amountLBRY.toString()) === 0 ||
                                    swap.loading ||
                                    amountLBRY > maxBurnAllowed ||
                                    tentativeALEX > 50
                                    ? '#525252'
                                    : '', // when disabled
                            }}
                            disabled={
                                amountLBRY === 0 ||
                                swap.loading === true ||
                                amountLBRY > maxBurnAllowed ||
                                tentativeALEX > 50
                            }
                            onClick={(e) => {
                                handleSubmit(e);
                            }}
                        >
                            {swap.loading ? (<>
                                <LoaderCircle size={18} className="animate animate-spin mx-auto" /> </>) : (
                                <>Burn</>
                            )}
                        </button> : <div
                            className="bg-balancebox text-white w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2 flex items-center justify-center white-auth-btn mb-4"
                        >
                            <Entry />
                        </div>}
                        <div className="terms-condition-wrapper flex tems-baseline">
                            <span className="text-[#FF37374D] mr-2 text-xl font-semibold">*</span>
                            <p className="lg:text-lg md:text-base sm:text-sm font-semibold md:pr-5 xs:pr-0 text-[#525252] dark:text-gray-300 md:w-9/12 xs:w-full">If the transaction doesn't complete as expected, please check the redeem page to locate your tokens.</p>
                        </div>
                    </div>
                    <BurnInfo maxBurnAllowed={maxBurnAllowed} />

                </div>
                <LoadingModal show={loadingModalV} message1={"Burn in Progress"} message2={"Burn transaction is being processed. This may take a few moments."} setShow={setLoadingModalV} />
                <SuccessModal show={successModalV} setShow={setSucessModalV} />
                <ErrorModal show={errorModalV.flag} setShow={setErrorModalV} title={errorModalV.title} message={errorModalV.message} />

            </div>
        </>
    );
};
export default BurnContent;
