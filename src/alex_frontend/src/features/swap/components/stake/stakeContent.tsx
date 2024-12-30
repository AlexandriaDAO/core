import React, { useEffect, useState } from "react";
import { Link } from "react-router";

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
import LoadingModal from "../loadingModal";
import SuccessModal from "../successModal";
import ErrorModal from "../errorModal";

const StakeContent = () => {
    const dispatch = useAppDispatch();
    const swap = useAppSelector((state) => state.swap);
    const { user } = useAppSelector((state) => state.auth);
    const alex = useAppSelector((state) => state.alex);
    const [amount, setAmount] = useState("0");
    const [loadingModalV, setLoadingModalV] = useState(false);
    const [successModalV, setSucessModalV] = useState(false);
    const [actionType, setActionType] = useState("Stake");
    const [errorModalV, setErrorModalV] = useState(false);

    const handleSubmit = (event: any) => {
        event.preventDefault();
        if(!user?.principal) return;
        dispatch(stakeAlex({amount,userPrincipal:user?.principal}));
        setActionType("Stake");
        setLoadingModalV(true);
    }
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (Number(e.target.value) < 0) {
            return;
        }
        setAmount(e.target.value);
    }
    const handleMaxAlex = () => {
        const userBal = Math.max(0, Number(alex.alexBal) - Number(alex.alexFee)).toFixed(4);
        setAmount(userBal);
    };
    useEffect(() => {
        if (user) {
            dispatch(getAccountAlexBalance(user.principal))
        }
    }, [user])
    useEffect(() => {

        if (swap.successStake === true || swap.unstakeSuccess === true || swap.burnSuccess === true || swap.successClaimReward === true) {
            dispatch(flagHandler());
            if(user) dispatch(getAccountAlexBalance(user.principal))
            setLoadingModalV(false);
            setSucessModalV(true);
        }
        if (swap.error) {
            setLoadingModalV(false);
            setErrorModalV(true);
            dispatch(flagHandler());


        }
    }, [user, swap])


    return (
        <>
            <div>
                <div className='grid grid-cols-1 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 mb-7'>
                    <div className='stake me-2'>
                        <div className="mb-4">
                            <label className="flex items-center text-radiocolor">
                                <span className="ml-2 text-tabsheading 2xl:text-xxltabsheading xl:text-xltabsheading lg:text-lgtabsheading md:text-mdtabsheading sm:text-smtabsheading font-bold">Stake</span>
                            </label>
                        </div>
                        <div className='border text-white py-5 px-7 rounded-borderbox mb-3'>
                            <h2 className='sm:text-2xl xs:text-xl text-radiocolor flex justify-between mb-5'>
                                <span className='flex font-extrabold '>Staked</span>
                                <span className='font-semibold flex'>{swap.stakeInfo.stakedAlex} ALEX</span>
                            </h2>
                            <ul className='ps-0'>
                                <li className='mb-4'>
                                    <div className='flex justify-between'>
                                        <strong className='sm:text-lg xs:text-sm text-radiocolor font-semibold me-1'>Daily earned</strong>
                                        <strong className='sm:text-lg xs:text-sm text-radiocolor font-semibold me-1'>0 ALEX</strong>
                                    </div>
                                </li>
                                <li className='mb-4'>
                                    <div className='flex justify-between'>
                                        <strong className='sm:text-lg xs:text-sm text-radiocolor font-semibold me-1'>Total earned</strong>
                                        <strong className='sm:text-lg xs:text-sm text-radiocolor font-semibold me-1'>0 ALEX</strong>
                                    </div>
                                </li>
                                <li className='mb-4'>
                                    <div className='flex justify-between'>
                                        <strong className='sm:text-lg xs:text-sm text-radiocolor font-semibold me-1'>Total Staked</strong>
                                        <strong className='sm:text-lg xs:text-sm text-radiocolor font-semibold me-1'>{swap.totalStaked} ALEX</strong>
                                    </div>
                                </li>
                                <li>
                                    <div className='flex justify-between'>
                                        <strong className='sm:text-lg xs:text-sm text-radiocolor font-semibold me-1'>Stakers</strong>
                                        <strong className='sm:text-lg xs:text-sm text-radiocolor font-semibold me-1'>{swap.totalStakers}</strong>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className='flex items-center mb-3'>
                            <strong className='text-2xl font-medium'>Stake Amount</strong>
                        </div>
                        <div className=' border bg-white py-8 px-5 rounded-borderbox mb-7 '>
                            <div className='mb-3'>
                                <div className='flex justify-between mb-5'>
                                    <h4 className='text-2xl font-medium text-darkgray'>Amount</h4>
                                    <input className='text-darkgray mr-[-10px] text-right bg-transparent text-2xl font-medium placeholder-darkgray w-full focus:outline-none focus:border-transparent' type='number' min={0} value={amount} onChange={(e) => { handleAmountChange(e) }} />
                                </div>
                                <div className='flex justify-between'>
                                    <div className='flex items-center'>
                                        <strong className='text-base text-multygray font-medium me-2'>Available Balance:<span className='text-base text-darkgray ms-2'>{alex.alexBal} ALEX</span></strong>
                                        <img className='w-5 h-5' src="images/8-logo.png" alt="apple" />
                                    </div>
                                    <Link to="" role="button" className='text-[#A7B1D7] underline text-base font-bold' onClick={() => handleMaxAlex()} >Max</Link>
                                </div>
                            </div>
                        </div>
                        <div>
                            {user ? <button
                                type="button"
                                className={`bg-balancebox text-white w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2 mb-6 ${parseFloat(amount) === 0 || swap.loading ? 'text-[#808080] cursor-not-allowed' : 'bg-balancebox text-white cursor-pointer'}`}
                                style={{
                                  backgroundColor: parseFloat(amount) === 0 || swap.loading ? '#525252' : '', // when disabled
                                }}
                                disabled={parseFloat(amount) === 0 || swap.loading === true}
                                onClick={(e) => {
                                    handleSubmit(e);
                                }}
                            >
                                {swap.loading ? (<>
                                    <LoaderCircle size={18} className="animate animate-spin mx-auto" /> </>) : (
                                    <>Stake</>
                                )}
                            </button> : <div
                                className="bg-balancebox text-white w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2 flex items-center justify-center white-auth-btn mb-4"
                            >
                                <Auth />
                            </div>}
                            <div className="terms-condition-wrapper flex tems-baseline">
                                <span className="text-[#FF37374D] mr-2 text-xl font-semibold">*</span>
                                <p className="sm:text-lg xs:text-sm font-semibold pr-5 text-[#525252] w-9/12">If the transaction doesn’t complete as expected, please check the redeem page to locate your tokens.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto lg:overflow-x-auto">
                    <StakedInfo setLoadingModalV={setLoadingModalV} setActionType={setActionType} />
                </div>
                <LoadingModal show={loadingModalV} message1={`${actionType} in Progress`} message2={"Transaction is being processed. This may take a few moments."} setShow={setLoadingModalV} />
                <SuccessModal show={successModalV} setShow={setSucessModalV} />
                <ErrorModal show={errorModalV} setShow={setErrorModalV}/>

            </div>
        </>
    );
};
export default StakeContent;
