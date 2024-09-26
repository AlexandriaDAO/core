import React, { useEffect, useState } from "react";
import { ActorSubclass } from "@dfinity/agent";

import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { _SERVICE as _SERVICESWAP } from '../../../../../../declarations/icp_swap/icp_swap.did'
import { _SERVICE as _SERVICELBRY } from '../../../../../../declarations/LBRY/LBRY.did';

import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightLong } from "@fortawesome/free-solid-svg-icons";
import { flagHandler } from "../../swapSlice";
import burnLbry from "../../thunks/burnLBRY";
import { ImSpinner8 } from "react-icons/im";
import Auth from "@/features/auth";
import getLbryBalance from "../../thunks/lbryIcrc/getLbryBalance";

interface BurnContentProps {
    actorSwap: ActorSubclass<_SERVICESWAP>;
    actorLbry: ActorSubclass<_SERVICELBRY>;
    isAuthenticated: boolean;

}
const BurnContent: React.FC<BurnContentProps> = ({ actorSwap, actorLbry, isAuthenticated }) => {
    const dispatch = useAppDispatch();
    const auth = useAppSelector((state) => state.auth);
    const swap = useAppSelector((state) => state.swap);
    const tokenomics = useAppSelector((state) => state.tokenomics);
    const lbryFee = 0.001;

    const [amountLBRY, setAmountLBRY] = useState(0);
    const [tentativeICP, setTentativeICP] = useState(Number);
    const [tentativeALEX, setTentativeALEX] = useState(Number);

    const handleSubmit = (event: any) => {
        event.preventDefault();
        dispatch(burnLbry({ actorSwap, actorLbry, amount: amountLBRY }))
    }
    const handleAmountLBRYChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        if (Number(e.target.value) < 0) return;

        setAmountLBRY(Number(e.target.value));
        setTentativeICP((Number(e.target.value) / Number(swap.lbryRatio)) / 2);
        setTentativeALEX(Number(e.target.value) * Number(tokenomics.alexMintRate));
    }
    const handleMaxLbry = () => {
        const userBal = Math.max(0, Number(swap.lbryBalance) - lbryFee); // Ensure non-negative user balance
        const lbryRatio = Number(swap.lbryRatio);
        const alexMintRate = Number(tokenomics.alexMintRate);

        setAmountLBRY(userBal);
        setTentativeICP(userBal / (lbryRatio * 2));
        setTentativeALEX(userBal * alexMintRate);
    };

    useEffect(() => {
        if (swap.burnSuccess === true) {
           // alert("Burned successfully!")
            dispatch(flagHandler())
            dispatch(getLbryBalance({ actorLbry, account: auth.user }))

        }
    }, [swap.burnSuccess])
    useEffect(() => {
        if (isAuthenticated === true) {
            dispatch(getLbryBalance({ actorLbry, account: auth.user }))
        }
    }, [auth.user, isAuthenticated])

    return (
        <>
            <div>
                <div className='mb-5 2xl:mb-10 xl:mb-7 lg:mb-7 md:mb-6 sm:mb-5'>
                    <h3 className="text-tabsheading 2xl:text-xxltabsheading xl:text-xltabsheading lg:text-lgtabsheading md:text-mdtabsheading sm:text-smtabsheading font-bold">Burn</h3>
                </div>
                <div className='grid grid grid-cols-1 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 mb-12'>
                    <div className='me-0 2xl:me-3 xl:me-3 lg:me-3 md:me-3 sm:me-0 mb-3 2xl:mb-0 xl:mb-0 lg:mb-3 md:mb-3 sm:mb-3'>
                        <div className=' border py-5 px-5 rounded-borderbox mb-7 '>
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
                                <Link to="" role="button" className='text-multycolor underline text-base font-bold' onClick={() => handleMaxLbry()} >Max</Link>
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
                        {isAuthenticated === true ? <button
                            type="button"
                            className="bg-balancebox text-white w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2"
                            disabled={amountLBRY === 0 || swap.loading === true}
                            onClick={(e) => {
                                handleSubmit(e);
                            }}
                        >
                            {swap.loading ? (<>
                                <ImSpinner8 size={18} className="animate animate-spin text-white mx-auto" /> </>) : (
                                <>Burn</>
                            )}
                        </button> : <div
                            className="bg-balancebox text-white w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2 flex items-center justify-center text-white white-auth-btn"
                        >
                            <Auth />
                        </div>}
                    </div>
                    <div className='ms-0 2xl:ms-3 xl:ms-3 lg:ms-3 md:ms-3 sm:ms-0'>
                        <div className='border border-gray-400 text-white py-5 px-5 rounded-2xl'>
                            <ul className='ps-0'>
                                <li className='flex justify-between mb-5'>
                                    <strong className='text-lg font-medium me-1 text-black'>Max LBRY Burn allowed:</strong>
                                    <span className='text-lg font-medium text-black'>{swap.maxLbryBurn.toFixed(4)} LBRY</span>
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
                                    <span className='text-lg font-medium text-black'><span className=' text-multycolor'>{lbryFee}</span> LBRY</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default BurnContent;
