import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ActorSubclass } from "@dfinity/agent";

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
import { ImSpinner8 } from "react-icons/im";
import Auth from "@/features/auth";

const SendContent = () => {
    const dispatch = useAppDispatch();

    const { user } = useAppSelector( state => state.auth);
    const icpLedger = useAppSelector((state) => state.icpLedger);
    const alex = useAppSelector((state) => state.alex);
    const swap = useAppSelector((state) => state.swap);

    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState("Select an option");
    const [selectedImage, setSelectedImage] = useState("");
    const [availableBalance, setAvailableBalnce] = useState("");
    const [destinationPrincipal, setDestinationPrincipal] = useState("");
    const [amount, setAmount] = useState("0");

    const options = [
        { value: "ICP", label: "ICP", img: "images/icp-logo.png", fee: 0.0001 },
        { value: "ALEX", label: "ALEX", img: "images/icp-logo.png", fee: 0.0001 },
        { value: "LBRY", label: "LBRY", img: "images/icp-logo.png", fee: 0.04 },
    ];

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value);
    };
    const handleDestinationPrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDestinationPrincipal(e.target.value);
    };
    const handleSelect = (option: any) => {
        setSelectedOption(option.label);
        setIsOpen(false);
        setSelectedImage(option.img);
    };
    const handleMax = () => {
        console.log("hhh");
        if (selectedOption === "ICP") {
            const userBal = Math.max(
                0,
                Number(icpLedger.accountBalance) - (options.find(option => option.value === "ICP")?.fee ?? 0)
            ).toFixed(4);
            setAmount(userBal);
        }
        else if (selectedOption === "ALEX") {
            const userBal = Math.max(
                0,
                Number(alex.alexBal) - (options.find(option => option.value === "ALEX")?.fee ?? 0)
            ).toFixed(4);
            setAmount(userBal);
        }
        else if (selectedOption === "LBRY") {
            const userBal = Math.max(
                0,
                Number(swap.lbryBalance) - (options.find(option => option.value === "LBRY")?.fee ?? 0)
            ).toFixed(4);
            setAmount(userBal);
        }
    };
    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (selectedOption === "ICP") {
            dispatch(transferICP({ amount, destination: destinationPrincipal, accountType: "principal" }))
        }
        else if (selectedOption === "ALEX") {
            dispatch(transferALEX({ amount, destination: destinationPrincipal }))
        }
        else if (selectedOption === "LBRY") {
            dispatch(transferLBRY({ amount, destination: destinationPrincipal }))
        }

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
        if (icpLedger.transferSuccess === true) {
            // alert("Success");
            dispatch(icpLedgerFlagHandler());
        }
    }, [icpLedger.transferSuccess])
    useEffect(() => {
        if (swap.transferSuccess === true) {
            //alert("Success");
            dispatch(flagHandler());
        }
    }, [swap.transferSuccess])
    return (<>
        <div>
            <div className='mb-5 2xl:mb-10 xl:mb-7 lg:mb-7 md:mb-6 sm:mb-5'>
                <h3 className="text-tabsheading 2xl:text-xxltabsheading xl:text-xltabsheading lg:text-lgtabsheading md:text-mdtabsheading sm:text-smtabsheading font-bold">Send</h3>
            </div>
            <div className='grid grid-cols-1 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 mb-12'>
                <div className='me-0 2xl:me-3 xl:me-3 lg:me-3 md:me-3 sm:me-0 mb-3 2xl:mb-0 xl:mb-0 lg:mb-3 md:mb-3 sm:mb-3'>
                    <div className='flex items-center mb-3'>
                        <span className='flex text-2xl font-bold w-circlewidth h-circleheight bg-balancebox rounded-full text-white justify-center items-center me-3'>1</span>
                        <strong className='text-2xl font-medium'>Choose token</strong>
                    </div>
                    <div className="relative inline-block w-full mb-4">
                        <div
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex justify-between items-center border border-gray-300 rounded-full bg-white py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-3 2xl:px-5 xl:px-5 lg:px-4 md:px-3 sm:px-3 text-2xl font-semibold cursor-pointer"
                        >
                            <div className='flex items-center'>
                                {selectedImage === "" ? <></> : <img className='h-5 w-5 me-3' src={selectedImage} />}
                                <span className='text-2xl font-medium text-black'>{selectedOption}</span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                        {isOpen && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                                {options.map((option, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleSelect(option)}
                                        className="flex items-center py-2 px-4 hover:bg-gray-100 cursor-pointer"
                                    >
                                        <img src={option.img} alt={option.label} className="h-5 w-5 mr-3" />
                                        <span>{option.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className='flex items-center mb-4'>
                        <span className='flex text-2xl font-bold w-circlewidth h-circleheight bg-balancebox rounded-full text-white justify-center items-center me-3'>2</span>
                        <strong className='text-2xl font-medium'>Enter the Principal ID</strong>
                    </div>
                    <div className=' border background-color: #efefef; py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-3 2xl:px-5 xl:px-5 lg:px-4 md:px-3 sm:px-3 rounded-full mb-4' >
                        <input className='text-multygray  bg-transparent text-2xl font-medium placeholder-multygray  focus:outline-none focus:border-transparent w-full' type='text' onChange={(e) => { handleDestinationPrincipalChange(e) }} value={destinationPrincipal} />
                    </div>
                    <div className='flex items-center mb-4'>
                        <span className='flex text-2xl font-bold w-circlewidth h-circleheight bg-balancebox rounded-full text-white justify-center items-center me-3'>3</span>
                        <strong className='text-2xl font-medium'>Enter the amount</strong>
                    </div>
                    <div className=' border background-color: #efefef; py-5 px-5 rounded-borderbox mb-7 '>
                        <div className='mb-3 w-full'>
                            <div className='flex justify-between mb-3'>
                                <h4 className='text-2xl font-medium text-darkgray'>Amount</h4>
                                <input className='text-darkgray text-right bg-transparent text-2xl font-medium placeholder-darkgray  focus:outline-none focus:border-transparent w-full' type='number' onChange={(e) => { handleAmountChange(e) }} value={amount} />
                            </div>
                            <div className='flex justify-between'>
                                <div className='flex items-center'>
                                    <strong className='text-base text-multygray font-medium me-2'>Available Balance:<span className='text-base text-darkgray ms-2'>  {availableBalance}</span></strong>
                                    <img className='w-5 h-5' src="images/8-logo.png" alt="apple" />
                                </div>
                                <Link role="button" to="" className='text-multycolor underline text-base font-medium' onClick={() => { handleMax() }}>Max</Link>
                            </div>
                        </div>
                    </div>
                    {user !== "" ? <button
                        type="button"
                        className="bg-balancebox text-white w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2"
                        disabled={parseFloat(amount) === 0 || swap.loading === true}
                        onClick={(e) => {
                            handleSubmit(e);
                        }}
                    >
                        {swap.loading ? (<>
                            <ImSpinner8 size={18} className="animate animate-spin text-white mx-auto" /> </>) : (
                            <>Send</>
                        )}
                    </button> : <div
                        className="bg-balancebox text-white w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2 flex items-center justify-center white-auth-btn"
                    >
                        <Auth />
                    </div>}
                </div>
                <div className='ms-0 2xl:ms-3 xl:ms-3 lg:ms-3 md:ms-3 sm:ms-0'>
                    {selectedOption !== "Select an option" ? <div className='border border-gray-400 text-white py-5 px-5 rounded-2xl'>
                        <ul className='ps-0 pb-7'>
                            <li className='flex justify-between mb-5'>
                                <strong className='text-lg font-semibold me-1 text-radiocolor'>Send</strong>
                                <span className='text-lg font-semibold text-radiocolor'>{amount}</span>
                            </li>
                            <li className='flex justify-between mb-5'>
                                <strong className='text-lg font-semibold me-5 text-radiocolor whitespace-nowrap'>Send to</strong>
                                <h6 className='truncate text-lg font-semibold text-radiocolor'>{destinationPrincipal}</h6>
                            </li>
                            <li className='flex justify-between mb-5'>
                                <strong className='text-lg font-semibold me-1 text-radiocolor'>Network Fees</strong>
                                <span className='text-lg font-semibold text-radiocolor'><span className='text-multycolor'>0.0001</span> {selectedOption}</span>
                            </li>
                        </ul>
                    </div> : <></>}


                </div>
            </div>
        </div>
    </>)
}
export default SendContent;