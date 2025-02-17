import React, { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Auth from "@/features/auth";
import { flagHandler } from "../../swapSlice";
import getLbryBalance from "../../thunks/lbryIcrc/getLbryBalance";
import LoadingModal from "../loadingModal";
import SuccessModal from "../successModal";
import ErrorModal from "../errorModal";
import { _SERVICE } from "../../../../../../declarations/nft_manager/nft_manager.did";
import getSpendingBalance from "../../thunks/lbryIcrc/getSpendingBalance";
import topUpLBRY from "../../thunks/lbryIcrc/topUpLBRY";
import getAlexSpendingBalance from "../../thunks/alexIcrc/getAlexSpendingBalance";
import { getNftManagerActor } from "@/features/auth/utils/authUtils";
import { Entry } from "@/layouts/parts/Header";

const TopupContent = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const swap = useAppSelector((state) => state.swap);

    const [loadingModalV, setLoadingModalV] = useState(false);
    const [successModalV, setSuccessModalV] = useState(false);
    const [errorModalV, setErrorModalV] = useState(false);
    const [amount, setAmount] = useState("0");
    const [withdrawLoading, setWithdrawLoading] = useState(false);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (Number(e.target.value) >= 0) {
            setAmount(e.target.value);
        }
    };

    const handleMax = () => {
        const userBal = Math.max(
            0,
            Number(swap.lbryBalance) - (Number(swap.lbryFee) * 2)
        ).toFixed(4);
        setAmount(userBal);
    };

    useEffect(() => {
        if (user?.principal) {
            dispatch(getSpendingBalance(user.principal));
            dispatch(getAlexSpendingBalance(user.principal));
        }
    }, [dispatch, user]);

    const handleTopUp = async () => {
        console.log("handleTopUp called", { user, amount });

        if (!user?.principal) {
            console.log("User validation failed", { user });
            return;
        }

        try {
            console.log("Dispatching topUpLBRY", { amount, userPrincipal: user.principal });
            setLoadingModalV(true);

            const result = await dispatch(
                topUpLBRY({
                    amount: amount,
                    userPrincipal: user.principal,
                })
            ).unwrap();

            console.log("topUpLBRY result:", result);
        } catch (error) {
            console.error("Failed to top up:", error);
            setLoadingModalV(false);
            setErrorModalV(true);
            dispatch(flagHandler());
        }
    };

    useEffect(() => {
        if (!user?.principal) return;

        if (swap.transferSuccess === true) {
            setLoadingModalV(false);
            setSuccessModalV(true);
            dispatch(getLbryBalance(user.principal));
            dispatch(getSpendingBalance(user.principal));
            dispatch(flagHandler());
        } else if (swap.error) {
            setLoadingModalV(false);
            setErrorModalV(true);
            dispatch(flagHandler());
        }
    }, [swap.transferSuccess, swap.error, dispatch, user]);

    const handleWithdraw = async () => {
        if (!user?.principal) {
            console.log("User validation failed", { user });
            return;
        }

        try {
            setWithdrawLoading(true);
            setLoadingModalV(true);

            const nftManager = await getNftManagerActor();
            const result = await nftManager.withdraw_topup();

            console.log("Withdraw result:", result);

            // Refresh balances after withdrawal
            await dispatch(getSpendingBalance(user.principal));
            await dispatch(getLbryBalance(user.principal));

            setLoadingModalV(false);
            setSuccessModalV(true);
        } catch (error) {
            console.error("Failed to withdraw:", error);
            setLoadingModalV(false);
            setErrorModalV(true);
        } finally {
            setWithdrawLoading(false);
        }
    };

    return (
        <>
            <div>
                <div className='mb-5 2xl:mb-10 xl:mb-7 lg:mb-7 md:mb-6 sm:mb-5'>
                    <h3 className="text-tabsheading 2xl:text-xxltabsheading xl:text-xltabsheading lg:text-lgtabsheading md:text-mdtabsheading sm:text-smtabsheading font-bold dark:text-gray-200">
                        Top Up LBRY
                    </h3>
                </div>
                <div className='grid grid-cols-1 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 mb-12'>
                    <div className='me-0 2xl:me-3 xl:me-3 lg:me-3 md:me-3 sm:me-0 mb-3 2xl:mb-0 xl:mb-0 lg:mb-3 md:mb-3 sm:mb-3'>
                        <div className='flex items-center mb-4'>
                            <span className='flex text-2xl font-bold w-circlewidth h-circleheight bg-balancebox rounded-full text-white justify-center items-center me-3'>1</span>
                            <strong className='text-2xl font-medium dark:text-gray-200'>Enter the amount</strong>
                        </div>
                        <div className='border dark:border-gray-700 bg-white dark:bg-gray-800 py-8 px-5 rounded-borderbox mb-3'>
                            <div className='flex justify-between items-center mb-5'>
                                <h4 className='lg:text-2xl md:text-xl sm:text-lg font-medium text-darkgray dark:text-gray-300'>LBRY Spending Wallet Balance</h4>
                                <span className='lg:text-2xl md:text-xl sm:text-lg font-medium text-darkgray dark:text-gray-300'>
                                    {swap.loading ? (
                                        <LoaderCircle size={18} className="animate animate-spin" />
                                    ) : (
                                        `${swap.spendingBalance} LBRY`
                                    )}
                                </span>
                            </div>
                            <div className='flex justify-between items-center'>
                                <h4 className='lg:text-2xl md:text-xl sm:text-lg font-medium text-darkgray dark:text-gray-300'>ALEX Spending Wallet Balance</h4>
                                <span className='lg:text-2xl md:text-xl sm:text-lg font-medium text-darkgray dark:text-gray-300'>
                                    {swap.loading ? (
                                        <LoaderCircle size={18} className="animate animate-spin" />
                                    ) : (
                                        `${swap.alexSpendingBalance} ALEX`
                                    )}
                                </span>
                            </div>
                        </div>
                        <div className='border dark:border-gray-700 bg-white dark:bg-gray-800 py-8 px-5 rounded-borderbox mb-7'>
                            <div className='mb-3'>
                                <div className='flex justify-between mb-5'>
                                    <h4 className='text-2xl font-medium text-darkgray dark:text-gray-300'>Amount</h4>
                                    <input
                                        className='text-darkgray dark:text-gray-200 text-right mr-[-10px] bg-transparent text-2xl font-medium placeholder-darkgray dark:placeholder-gray-400 focus:outline-none focus:border-transparent w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                                        type='number'
                                        onChange={handleAmountChange}
                                        value={amount}
                                    />
                                </div>
                                <div className='flex justify-between'>
                                    <div className='flex items-center'>
                                        <strong className='text-base text-multygray dark:text-gray-300 font-medium me-2'>
                                            Available Balance:
                                            <span className='text-base text-darkgray dark:text-gray-200 ms-2'>
                                                {swap.lbryBalance} LBRY
                                            </span>
                                        </strong>
                                    </div>
                                    <button
                                        className='text-[#A7B1D7] dark:text-blue-400 underline text-base font-medium'
                                        onClick={handleMax}
                                    >
                                        Max
                                    </button>
                                </div>
                            </div>
                        </div>
                        {user ? (
                            <div className="flex flex-col gap-3">
                                <button
                                    type="button"
                                    className={`w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2
                                        ${parseFloat(amount) === 0 || swap.loading ? 'text-[#808080] cursor-not-allowed' : 'bg-balancebox text-white cursor-pointer'}`}
                                    style={{
                                        backgroundColor: parseFloat(amount) === 0 || swap.loading ? '#525252' : '',
                                    }}
                                    disabled={parseFloat(amount) === 0 || swap.loading}
                                    onClick={handleTopUp}
                                >
                                    {swap.loading ? (
                                        <LoaderCircle size={18} className="animate animate-spin mx-auto" />
                                    ) : (
                                        <>Top Up</>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    className={`w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2
                                        ${withdrawLoading ? 'text-[#808080] cursor-not-allowed' : 'bg-white dark:bg-gray-800 text-balancebox border-2 border-balancebox cursor-pointer dark:text-blue-400 dark:border-blue-400'}`}
                                    disabled={withdrawLoading}
                                    onClick={handleWithdraw}
                                >
                                    {withdrawLoading ? (
                                        <LoaderCircle size={18} className="animate animate-spin mx-auto" />
                                    ) : (
                                        <>Withdraw All</>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="bg-balancebox text-white w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2 flex items-center justify-center white-auth-btn">
                                <Entry />
                            </div>
                        )}
                    </div>
                    <div className='ms-0 2xl:ms-3 xl:ms-3 lg:ms-3 md:ms-3 sm:ms-0'>
                        <div className='border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 py-5 px-5 rounded-2xl'>
                            <ul className='ps-0 pb-7'>
                                <li className='flex justify-between mb-5'>
                                    <strong className='lg:text-lg md:text-base sm:text-sm font-semibold me-1 text-radiocolor dark:text-gray-200'>Amount</strong>
                                    <span className='text-lg font-semibold text-radiocolor dark:text-gray-200'>{amount} LBRY</span>
                                </li>
                                <li className='flex justify-between mb-5'>
                                    <strong className='lg:text-lg md:text-base sm:text-sm font-semibold me-1 text-radiocolor dark:text-gray-200'>Network Fees</strong>
                                    <span className='lg:text-lg md:text-base sm:text-sm font-semibold text-radiocolor dark:text-gray-200'>
                                        <span className='text-multycolor dark:text-blue-400'>{swap.lbryFee}</span> LBRY
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <LoadingModal
                    show={loadingModalV}
                    message1={` ${withdrawLoading ? "Withdrawal"  : "Top up"} in Progress `}
                    message2="Your transaction is being processed. This may take a few moments."
                    setShow={setLoadingModalV}
                />
                <SuccessModal show={successModalV} setShow={setSuccessModalV} />
                <ErrorModal show={errorModalV} setShow={setErrorModalV} />
            </div>
        </>
    );
};

export default TopupContent;
