import React, { useEffect, useState } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { _SERVICE as _SERVICESWAP } from '../../../../../../declarations/icp_swap/icp_swap.did'
import { _SERVICE as _SERVICELBRY } from '../../../../../../declarations/LBRY/LBRY.did';

import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightLong } from "@fortawesome/free-solid-svg-icons";
import { flagHandler } from "../../swapSlice";
import burnLbry from "../../thunks/burnLBRY";
import Auth from "@/features/auth";
import getLbryBalance from "../../thunks/lbryIcrc/getLbryBalance";
import { LoaderCircle } from "lucide-react";
import getCanisterBal from "@/features/icp-ledger/thunks/getCanisterBal";
import getCanisterArchivedBal from "../../thunks/getCanisterArchivedBal";
import LoadingModal from "../loadingModal";
import SuccessModal from "../successModal";
import ErrorModal from "../errorModal";

const BurnContent = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const swap = useAppSelector((state) => state.swap);
    const icpLedger = useAppSelector((state) => state.icpLedger);
    const tokenomics = useAppSelector((state) => state.tokenomics);

    const [amountLBRY, setAmountLBRY] = useState(0);
    const [tentativeICP, setTentativeICP] = useState(Number);
    const [tentativeALEX, setTentativeALEX] = useState(Number);
    const [maxBurnAllowed, setMaxburnAllowed] = useState(Number);
    const [loadingModalV, setLoadingModalV] = useState(false);
    const [successModalV, setSucessModalV] = useState(false);
    const [errorModalV, setErrorModalV] = useState(false);



    const handleSubmit = (event: any) => {
        event.preventDefault();
        dispatch(burnLbry(amountLBRY));
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
        if(!user) return;
        if (swap.burnSuccess === true) {
            dispatch(flagHandler())
            dispatch(getLbryBalance(user.principal))
            setLoadingModalV(false);
            setSucessModalV(true);
        }
    }, [user, swap.burnSuccess])
    useEffect(() => {
        if (user) {
            dispatch(getLbryBalance(user.principal));
        }
        dispatch(getCanisterBal());
        dispatch(getCanisterArchivedBal());
    }, [user])
    useEffect(() => {
        let lbryPerIcp = Number(swap.lbryRatio) * 2;
        let canisterBalance = Number(icpLedger.canisterBalance);
        let totalArchivedBalance = Number(swap.canisterArchivedBal.canisterArchivedBal);
        let totalUnclaimedBalance = Number(swap.canisterArchivedBal.canisterUnClaimedIcp);
        let remainingBalance = canisterBalance - (totalUnclaimedBalance + totalArchivedBalance);
        let actualAvailable = remainingBalance / 2; // 50% for stakers 
        let maxAllowed = actualAvailable * lbryPerIcp;
        setMaxburnAllowed(maxAllowed);
    }, [swap.canisterArchivedBal, swap.lbryRatio, icpLedger.canisterBalance])
    useEffect(() => {
        if (swap.error) {
            setLoadingModalV(false);
            setErrorModalV(true);
            dispatch(flagHandler());

        }
    }, [swap])


    return (
        <>
            <div>
                <div className='mb-5 2xl:mb-10 xl:mb-7 lg:mb-7 md:mb-6 sm:mb-5'>
                    <h3 className="text-tabsheading 2xl:text-xxltabsheading xl:text-xltabsheading lg:text-lgtabsheading md:text-mdtabsheading sm:text-smtabsheading font-bold">Burn</h3>
                </div>
                <div className='grid grid-cols-1 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 mb-12'>
                    <div className='me-0 2xl:me-3 xl:me-3 lg:me-3 md:me-3 sm:me-0 mb-3 2xl:mb-0 xl:mb-0 lg:mb-3 md:mb-3 sm:mb-3'>
                        <div className='bg-white border py-5 px-5 rounded-borderbox mb-7 '>
                            <div className='flex justify-between mb-3'>
                                <h4 className='text-2xl font-medium text-multygray'>Amount</h4>
                                <input className='text-2xl font-medium text-darkgray text-right bg-transparent w-full placeholder-darkgray  focus:outline-none focus:border-transparent' type='integer' value={amountLBRY} defaultValue={0} min={0} onChange={(e) => {
                                    handleAmountLBRYChange(e)
                                }} />
                            </div>
                            <div className='flex justify-between'>
                                <div className='flex items-center'>
                                    <strong className='text-base text-multygray font-medium me-1'>Balance:<span className='text-darkgray ms-2'>{swap.lbryBalance} LBRY</span></strong>
                                    <img className='w-4 h-4' src="images/8-logo.png" alt="apple" />
                                </div>
                                <Link to="" role="button" className='text-[#A7B1D7] underline text-base font-bold' onClick={() => handleMaxLbry()} >Max</Link>
                            </div>
                        </div>
                        <h5 className='text-xl font-medium mb-4'>you get</h5>
                        <div className=' border background-color: #efefef; py-4 px-5 rounded-full mb-4'>
                            <div className='flex justify-between'>
                                <div className='flex items-center'>
                                    <div className='me-3'>
                                        <img className='w-6 h-6' src="images/8-logo.png" alt="apple" />
                                    </div>
                                    <div>
                                        <h4 className='text-2xl font-medium'>ICP</h4>
                                    </div>
                                </div>
                                <h3 className='text-right text-2xl font-medium'>{tentativeICP.toFixed(4)}</h3>
                            </div>
                        </div>
                        <div className=' border background-color: #efefef; py-4 px-5 rounded-full mb-4'>
                            <div className='flex justify-between'>
                                <div className='flex items-center'>
                                    <div className='me-3'>
                                        <img className='w-6 h-6' src="images/8-logo.png" alt="apple" />
                                    </div>
                                    <div>
                                        <h4 className='text-2xl font-medium'>ALEX</h4>
                                    </div>
                                </div>
                                <h3 className='text-right text-2xl font-medium'>{tentativeALEX.toFixed(4)}</h3>
                            </div>
                        </div>
                        {user ? <button
                            type="button"
                            className={`bg-balancebox text-white w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2 mb-4 ${parseInt(amountLBRY.toString()) === 0 || swap.loading ? 'text-[#808080] cursor-not-allowed' : 'bg-balancebox text-white cursor-pointer'}`}
                            style={{
                                backgroundColor: parseInt(amountLBRY.toString()) === 0 || swap.loading ? '#525252' : '', // when disabled
                            }}
                            disabled={amountLBRY === 0 || swap.loading === true}
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
                            <Auth />
                        </div>}
                        <div className="terms-condition-wrapper flex tems-baseline">
                            <span className="text-[#FF37374D] mr-2 text-xl font-semibold">*</span>
                            <p className="text-lg font-semibold pr-5 text-[#525252] w-9/12">If the transaction doesn’t complete as expected, please check the redeem page to locate your tokens.</p>
                        </div>
                    </div>
                    <div className='ms-0 2xl:ms-3 xl:ms-3 lg:ms-3 md:ms-3 sm:ms-0'>
                        <div className='border border-gray-400 text-white py-5 px-5 rounded-2xl'>
                            <ul className='ps-0'>
                                <li className='flex justify-between mb-5'>
                                    <strong className='text-lg font-medium me-1 text-black'>Max LBRY Burn allowed:</strong>
                                    <span className='text-lg font-medium text-black'>{maxBurnAllowed.toFixed(4)} LBRY</span>
                                </li>
                                <li className='flex justify-between mb-5'>
                                    <strong className='text-lg font-medium  me-1 text-black'>{Number(swap.lbryRatio).toFixed(4)} LBRY
                                        <span className='mx-2'><FontAwesomeIcon icon={faArrowRightLong} /></span>0.5 ICP
                                    </strong>
                                </li>
                                <li className='flex justify-between mb-5'>
                                    <strong className='text-lg font-medium me-1 text-black'>1 LBRY
                                        <span className='mx-2'><FontAwesomeIcon icon={faArrowRightLong} /></span>{tokenomics.alexMintRate} ALEX
                                    </strong>
                                </li>
                                <li className='flex justify-between'>
                                    <strong className='text-lg font-medium me-1 text-black'>Network Fees</strong>
                                    <span className='text-lg font-medium text-black'><span className=' text-multycolor'>{swap.lbryFee}</span> LBRY</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <LoadingModal show={loadingModalV} message1={"Burn in Progress"} message2={"Burn transaction is being processed. This may take a few moments."} setShow={setLoadingModalV} />
                <SuccessModal show={successModalV} setShow={setSucessModalV} />
                <ErrorModal show={errorModalV} setShow={setErrorModalV}/>

            </div>
        </>
    );
};
export default BurnContent;
