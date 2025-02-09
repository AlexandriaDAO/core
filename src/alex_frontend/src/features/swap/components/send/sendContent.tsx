import React, { useEffect, useState } from "react";
import { Link } from "react-router";

import transferICP from "@/features/icp-ledger/thunks/transferICP";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";

import { _SERVICE as _SERVICELBRY } from '../../../../../../declarations/LBRY/LBRY.did';
import { _SERVICE as _SERVICEALEX } from '../../../../../../declarations/ALEX/ALEX.did';
import { _SERVICE as _SERVICEICPLEDGER } from '../../../../../../declarations/icp_ledger_canister/icp_ledger_canister.did'
import transferALEX from "../../thunks/alexIcrc/transferALEX";
import transferLBRY from "../../thunks/lbryIcrc/transferLBRY";
import { icpLedgerFlagHandler } from "@/features/icp-ledger/icpLedgerSlice";
import { flagHandler } from "../../swapSlice";
import { icp_fee, options } from "@/utils/utils";
import { LoaderCircle } from "lucide-react";
import LoadingModal from "../loadingModal";
import SuccessModal from "../successModal";
import { alexFlagHandler } from "../../alexSlice";
import getIcpBal from "@/features/icp-ledger/thunks/getIcpBal";
import getAccountAlexBalance from "../../thunks/alexIcrc/getAccountAlexBalance";
import getLbryBalance from "../../thunks/lbryIcrc/getLbryBalance";
import ErrorModal from "../errorModal";
import { Entry } from "@/layouts/parts/Header";
import { Principal } from "@dfinity/principal";

const SendContent = () => {
    const dispatch = useAppDispatch();

    const { user } = useAppSelector(state => state.auth);
    const icpLedger = useAppSelector((state) => state.icpLedger);
    const alex = useAppSelector((state) => state.alex);
    const swap = useAppSelector((state) => state.swap);

    const [isOpen, setIsOpen] = useState(false);
    const [loadingModalV, setLoadingModalV] = useState(false);
    const [successModalV, setSucessModalV] = useState(false);
    const [errorModalV, setErrorModalV] = useState(false);
    const [selectedOption, setSelectedOption] = useState("Select an option");
    const [selectedImage, setSelectedImage] = useState("");
    const [availableBalance, setAvailableBalnce] = useState("");
    const [destinationPrincipal, setDestinationPrincipal] = useState("");
    const [principalError, setPrincipalError] = useState("");
    const [amount, setAmount] = useState("0");
    const [fee, setFee] = useState();

    const validatePrincipal = (principal: string): boolean => {
        try {
            if (!principal) {
                setPrincipalError("Principal ID is required");
                return false;
            }
            Principal.fromText(principal);
            setPrincipalError("");
            return true;
        } catch (error) {
            setPrincipalError("Invalid Principal ID format");
            return false;
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (Number(e.target.value) >= 0) {
            setAmount(e.target.value);
        }
    };

    const handleDestinationPrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setDestinationPrincipal(value);
        validatePrincipal(value);
    };

    const handleSelect = (option: any) => {
        setFee(option.fee);
        setSelectedOption(option.label);
        setIsOpen(false);
        let img = "images/8-logo.png";
        if (option.label === "ALEX") {
            img = "images/alex-logo.svg";
        } else if (option.label === "LBRY") {
            img = "images/lbry-logo.svg";
        }
        setSelectedImage(img);
    };
    const handleMax = () => {
        // since we dont need approval here 
        if (selectedOption === "ICP") {
             const userBal = Math.max(
                  0,
                  Number(icpLedger.accountBalance) - 1 * icp_fee
                ).toFixed(4);
     
            setAmount(userBal);
        }
        else if (selectedOption === "ALEX") {
            const userBal = Math.max(
                0,
                Number(alex.alexBal) - (Number(alex.alexFee) * 1)
            ).toFixed(4);
            setAmount(userBal);
        }
        else if (selectedOption === "LBRY") {
            const userBal = Math.max(
                0,
                Number(swap.lbryBalance) - (Number(swap.lbryFee) * 1)
            ).toFixed(4);
            setAmount(userBal);
        }
    };

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!validatePrincipal(destinationPrincipal)) {
            return;
        }
        if (selectedOption === "ICP") {
            dispatch(transferICP({ amount, destination: destinationPrincipal, accountType: "principal" }));
        }
        else if (selectedOption === "ALEX") {
            dispatch(transferALEX({ amount, destination: destinationPrincipal }));
        }
        else if (selectedOption === "LBRY") {
            dispatch(transferLBRY({ amount, destination: destinationPrincipal }));
        }
        setLoadingModalV(true);
    }

    useEffect(() => {
        if (selectedOption === "ICP") {
            setAvailableBalnce(icpLedger.accountBalance + " " + selectedOption);
        }
        else if (selectedOption === "ALEX") {
            setAvailableBalnce(alex.alexBal + " " + selectedOption);
        }
        else if (selectedOption === "LBRY") {
            setAvailableBalnce(swap.lbryBalance + " " + selectedOption);
        }
    }, [selectedOption, icpLedger.accountBalance, alex.alexBal, swap.lbryBalance])

    useEffect(() => {
        if(!user) return;
        if (icpLedger.transferSuccess === true) {
            setLoadingModalV(false);
            setSucessModalV(true);
            dispatch(getIcpBal(user.principal));
            dispatch(icpLedgerFlagHandler());

        }
        else if (alex.transferSuccess === true) {
            setLoadingModalV(false);
            setSucessModalV(true);
            dispatch(getAccountAlexBalance(user.principal))

            dispatch((alexFlagHandler()));

        }
        else if (swap.transferSuccess === true) {
            setLoadingModalV(false);
            setSucessModalV(true);
            dispatch(getLbryBalance(user.principal))
            dispatch((flagHandler()));
        }
        else if (swap.error || alex.error || icpLedger.error) {
            setLoadingModalV(false);
            setErrorModalV(true);
            dispatch(flagHandler());


        }
    }, [user, icpLedger, swap, alex])

    return (<>
        <div>
            <div className='mb-5 2xl:mb-10 xl:mb-7 lg:mb-7 md:mb-6 sm:mb-5'>
                <h3 className="text-tabsheading 2xl:text-xxltabsheading xl:text-xltabsheading lg:text-lgtabsheading md:text-mdtabsheading sm:text-smtabsheading font-bold">Send</h3>
            </div>
            <div className='grid grid-cols-1 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 mb-12'>
                <div className='me-0 2xl:me-3 xl:me-3 lg:me-3 md:me-3 sm:me-0 mb-3 2xl:mb-0 xl:mb-0 lg:mb-3 md:mb-3 sm:mb-3'>
                    <div className='flex items-center mb-3'>
                        <span className='flex text-2xl font-bold w-circlewidth h-circleheight bg-balancebox rounded-full text-white justify-center items-center me-3'>1</span>
                        <strong className='lg:text-2xl md:text-xl sm:text-lg xs:text-base font-medium'>Choose token</strong>
                    </div>
                    <div className="relative inline-block w-full mb-4">
                        <div
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex justify-between items-center border border-gray-300 dark:border-gray-700 rounded-full bg-white dark:bg-gray-800 py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-3 2xl:px-5 xl:px-5 lg:px-4 md:px-3 sm:px-3 text-2xl font-semibold cursor-pointer"
                        >
                            <div className='flex items-center'>
                                {selectedImage === "" ? <></> : <img className='h-5 w-5 me-3' src={selectedImage} />}
                                <span className='lg:text-xl md:text-lg xs:text-base font-medium text-black dark:text-gray-200'>{selectedOption}</span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                        {isOpen && (
                            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg">
                                {options.map((option, index) => {
                                    let logoSrc = "images/8-logo.png";
                                    if (option.label === "ALEX") {
                                        logoSrc = "images/alex-logo.svg";
                                    } else if (option.label === "LBRY") {
                                        logoSrc = "images/lbry-logo.svg";
                                    }
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => handleSelect(option)}
                                            className="flex items-center py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-gray-200"
                                        >
                                            <img src={logoSrc} alt={option.label} className="h-5 w-5 mr-3" />
                                            <span>{option.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <div className='flex items-center mb-4'>
                        <span className='flex text-2xl font-bold w-circlewidth h-circleheight bg-balancebox rounded-full text-white justify-center items-center me-3'>2</span>
                        <strong className='lg:text-2xl md:text-xl sm:text-lg xs:text-base font-medium dark:text-gray-200'>Enter the Principal ID</strong>
                    </div>
                    <div className='border bg-white dark:bg-gray-800 dark:border-gray-700 py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-3 2xl:px-5 xl:px-5 lg:px-4 md:px-3 sm:px-3 rounded-full mb-4' >
                        <input 
                            className={`text-multygray dark:text-gray-300 bg-transparent text-xl font-medium placeholder-multygray dark:placeholder-gray-400 focus:outline-none focus:border-transparent w-full ${principalError ? 'border-red-500' : ''}`} 
                            type='text' 
                            onChange={(e) => { handleDestinationPrincipalChange(e) }} 
                            value={destinationPrincipal} 
                            placeholder="Enter Principal ID"
                        />
                    </div>
                    {principalError && (
                        <div className="text-red-500 text-sm mb-4 px-5">
                            {principalError}
                        </div>
                    )}
                    <div className='flex items-center mb-4'>
                        <span className='flex text-2xl font-bold w-circlewidth h-circleheight bg-balancebox rounded-full text-white justify-center items-center me-3'>3</span>
                        <strong className='lg:text-2xl md:text-xl sm:text-lg xs:text-base font-medium dark:text-gray-200'>Enter the amount</strong>
                    </div>
                    <div className='border bg-white dark:bg-gray-800 dark:border-gray-700 py-5 px-5 rounded-borderbox mb-7'>
                        <div className='mb-3 w-full'>
                            <div className='flex justify-between mb-3'>
                                <h4 className='lg:text-2xl md:text-xl sm:text-lg xs:text-base font-medium text-darkgray dark:text-gray-300'>Amount</h4>
                                <input className='text-darkgray dark:text-gray-200 mr-[-10px] text-right bg-transparent lg:text-2xl md:text-xl sm:text-lg xs:text-base font-medium placeholder-darkgray dark:placeholder-gray-400 focus:outline-none focus:border-transparent w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' type='number' onChange={(e) => { handleAmountChange(e) }} value={amount} />
                            </div>
                            <div className='flex justify-between'>
                                <div className='flex items-center'>
                                    <strong className='text-base text-multygray dark:text-gray-300 font-medium me-2'>Available Balance:<span className='text-base text-darkgray dark:text-gray-200 ms-2'>{availableBalance}</span></strong>
                                    {selectedOption === "ICP" && <img className='w-5 h-5' src="images/8-logo.png" alt="icp" />}
                                    {selectedOption === "ALEX" && <img className='w-5 h-5' src="images/alex-logo.svg" alt="alex" />}
                                    {selectedOption === "LBRY" && <img className='w-5 h-5' src="images/lbry-logo.svg" alt="lbry" />}
                                </div>
                                <Link role="button" to="" className='text-[#A7B1D7] dark:text-blue-400 underline text-base font-medium' onClick={() => { handleMax() }}>Max</Link>
                            </div>
                        </div>
                    </div>
                    {user ? <button
                        type="button"
                        className={`w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2
                            ${parseFloat(amount) === 0 || swap.loading ? 'text-[#808080] cursor-not-allowed' : 'bg-balancebox text-white cursor-pointer'}`} style={{
                            backgroundColor: parseFloat(amount) === 0 || swap.loading ? '#525252' : '', // when disabled
                        }}
                        disabled={parseFloat(amount) === 0 || swap.loading === true}
                        onClick={(e) => {
                            handleSubmit(e);
                        }}
                    >
                        {swap.loading ? (<>
                            <LoaderCircle size={18} className="animate animate-spin mx-auto" /> </>) : (
                            <>Send</>
                        )}
                    </button> : <div
                        className="bg-balancebox text-white w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2 flex items-center justify-center white-auth-btn"
                    >
                        <Entry />
                    </div>}
                </div>
                <div className='ms-0 2xl:ms-3 xl:ms-3 lg:ms-3 md:ms-3 sm:ms-0'>
                    {selectedOption !== "Select an option" ? <div className='border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 py-5 px-5 rounded-2xl'>
                        <ul className='ps-0 pb-7'>
                            <li className='flex justify-between mb-5'>
                                <strong className='text-lg font-semibold me-1 text-radiocolor dark:text-gray-200'>Send</strong>
                                <span className='text-lg font-semibold text-radiocolor dark:text-gray-200'>{amount}</span>
                            </li>
                            <li className='flex justify-between mb-5'>
                                <strong className='text-lg font-semibold me-5 text-radiocolor dark:text-gray-200 whitespace-nowrap'>Send to</strong>
                                <h6 className='truncate text-lg font-semibold text-radiocolor dark:text-gray-200'>{destinationPrincipal}</h6>
                            </li>
                            <li className='flex justify-between mb-5'>
                                <strong className='text-lg font-semibold me-1 text-radiocolor dark:text-gray-200'>Network Fees</strong>
                                <span className='text-lg font-semibold text-radiocolor dark:text-gray-200'><span className='text-multycolor dark:text-blue-400'>{fee}</span> {selectedOption}</span>
                            </li>
                        </ul>
                    </div> : <></>}


                </div>
            </div>
            <LoadingModal show={loadingModalV} message1={"Transfer in Progress"} message2={"Your transaction is being processed. This may take a few moments."} setShow={setLoadingModalV} />
            <SuccessModal show={successModalV} setShow={setSucessModalV} />
            <ErrorModal show={errorModalV} setShow={setErrorModalV} />

        </div>
    </>)
}
export default SendContent;