import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { _SERVICE as _SERVICESWAP } from "../../../../../../declarations/icp_swap/icp_swap.did"
import { _SERVICE as _SERVICEALEX } from "../../../../../../declarations/ALEX/ALEX.did";

import getAccountAlexBalance from "../../thunks/alexIcrc/getAccountAlexBalance";
import { flagHandler } from "../../swapSlice";
import stakeAlex from "../../thunks/stakeAlex";
import StakedInfo from "./stakeInfo";
import Auth from "@/features/auth";
import { LoaderCircle } from "lucide-react";

const StakeContent = () => {
    const dispatch = useAppDispatch();
    const swap = useAppSelector((state) => state.swap);
    const {user} = useAppSelector((state) => state.auth);
    const alex = useAppSelector((state) => state.alex);
    const [amount, setAmount] = useState("0");
    let alexFee = 0.0001;

    const handleSubmit = (event: any) => {
        event.preventDefault();
        dispatch(stakeAlex( amount ))
    }
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (Number(e.target.value) < 0) {
            return;
        }
        setAmount(e.target.value);
    }
    const handleMaxAlex = () => {
        const userBal = Math.max(0, Number(alex.alexBal) - alexFee).toFixed(4);
        setAmount(userBal);
    };

    useEffect(() => {
        if (swap.successStake === true) {
            alert("Successfuly staked");
            dispatch(flagHandler());
        }
    }, [swap])

    useEffect(() => {
        if (user !== '') {
            dispatch(getAccountAlexBalance(user))
        }
    }, [user])
    useEffect(() => {
        if (swap.successStake === true || swap.unstakeSuccess === true || swap.burnSuccess === true || swap.successClaimReward === true) {
            dispatch(getAccountAlexBalance(user))
        }
    }, [swap])
    return (
        <>
            <div>
                <div className='grid grid-cols-1 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 mb-7'>
                    <div className='stake me-2'>
                        <div className="mb-4">
                            <label className="flex items-center text-radiocolor">
                                <input type="radio" name="option" className="form-radio h-4 w-4 text-radiocolor" />
                                <span className="ml-2 text-tabsheading 2xl:text-xxltabsheading xl:text-xltabsheading lg:text-lgtabsheading md:text-mdtabsheading sm:text-smtabsheading font-bold">Stake</span>
                            </label>
                        </div>
                        <div className='border text-white py-5 px-7 rounded-borderbox mb-3'>
                            <h2 className='text-2xl text-radiocolor flex justify-between mb-5'>
                                <span className='flex font-extrabold '>Staked</span>
                                <span className='font-semibold flex'>0 ALEX</span>
                            </h2>
                            <ul className='ps-0'>
                                <li className='mb-4'>
                                    <div className='flex justify-between'>
                                        <strong className='text-lg text-radiocolor font-semibold me-1'>Daily earned</strong>
                                        <strong className='text-lg text-radiocolor font-semibold me-1'>0 ALEX</strong>
                                    </div>
                                </li>
                                <li className='mb-4'>
                                    <div className='flex justify-between'>
                                        <strong className='text-lg text-radiocolor font-semibold me-1'>Total earned</strong>
                                        <strong className='text-lg text-radiocolor font-semibold me-1'>0 ALEX</strong>
                                    </div>
                                </li>
                                <li className='mb-4'>
                                    <div className='flex justify-between'>
                                        <strong className='text-lg text-radiocolor font-semibold me-1'>Total Staked</strong>
                                        <strong className='text-lg text-radiocolor font-semibold me-1'>{swap.totalStaked} ALEX</strong>
                                    </div>
                                </li>
                                <li>
                                    <div className='flex justify-between'>
                                        <strong className='text-lg text-radiocolor font-semibold me-1'>Stakers</strong>
                                        <strong className='text-lg text-radiocolor font-semibold me-1'>823</strong>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className='flex items-center mb-3'>
                            <strong className='text-2xl font-medium'>Stake Amount</strong>
                        </div>
                        <div className=' border background-color: #efefef; py-5 px-5 rounded-borderbox mb-7 '>
                            <div className='mb-3'>
                                <div className='flex justify-between mb-3'>
                                    <h4 className='text-2xl font-medium text-darkgray'>Amount</h4>
                                    <input className='text-darkgray text-right bg-transparent text-2xl font-medium placeholder-darkgray w-full focus:outline-none focus:border-transparent' type='number' min={0} value={amount} onChange={(e) => { handleAmountChange(e) }} />
                                </div>
                                <div className='flex justify-between'>
                                    <div className='flex items-center'>
                                        <strong className='text-base text-multygray font-medium me-2'>Available Balance:<span className='text-base text-darkgray ms-2'>{alex.alexBal} ALEX</span></strong>
                                        <img className='w-5 h-5' src="images/8-logo.png" alt="apple" />
                                    </div>
                                    <Link to="" role="button" className='text-multycolor underline text-base font-bold' onClick={() => handleMaxAlex()} >Max</Link>
                                </div>
                            </div>
                        </div>
                        <div>
                            {user !== '' ? <button
                                type="button"
                                className="bg-balancebox text-white w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2"
                                disabled={parseFloat(amount) === 0 || swap.loading === true}
                                onClick={(e) => {
                                    handleSubmit(e);
                                }}
                            >
                                {swap.loading ? (<>
                                    <LoaderCircle size={18} className="animate animate-spin text-white mx-auto" /> </>) : (
                                    <>Stake</>
                                )}
                            </button> : <div
                                className="bg-balancebox text-white w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2 flex items-center justify-center white-auth-btn"
                            >
                                <Auth />
                            </div>}
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto lg:overflow-x-auto">
                    <StakedInfo />
                </div>
            </div>
        </>
    );
};
export default StakeContent;
