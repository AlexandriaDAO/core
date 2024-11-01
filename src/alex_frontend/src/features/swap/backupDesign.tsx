import React, { useEffect } from 'react';
import { useState } from 'react';
import useSession from '@/hooks/useSession';

import "./style.css"

import { useAppSelector } from '@/store/hooks/useAppSelector';
import { faClone } from '@fortawesome/free-regular-svg-icons';
import { faArrowRightLong, faExclamation, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import AccountCards from './components/balance/accountCards';
import BalanceContent from './components/balance/balanceContent';

const Home = () => {
    const auth = useAppSelector(state => state.auth);
    const [activeTab, setActiveTab] = useState(1);

    const [selectedOption, setSelectedOption] = useState("Select an option");
    const [selectedImage, setSelectedImage] = useState("");

    const [isOpen, setIsOpen] = useState(false);


    const options = [
        { value: "option1", label: "ICP", img: "images/8-logo.png" },
        { value: "option2", label: "ALEX", img: "images/8-logo.png" },
        { value: "option3", label: "LBRY", img: "images/8-logo.png" },
    ];
    // const tabs = [
    //     { id: 1, label: 'Balance', content: <BalanceContent /> },
    //     { id: 2, label: 'Swap', content: <BalanceContent /> },
    //     { id: 3, label: 'Send', content: <BalanceContent /> },
    //     { id: 4, label: 'Receive', content: <BalanceContent /> },
    //     { id: 5, label: 'Burn', content: <BalanceContent /> },
    //     { id: 6, label: 'Stake', content: <BalanceContent /> },
    //     { id: 7, label: 'Transaction history', content: < BalanceContent actorAlex={undefined}/> }
    // ];

    const handleSelect = (option: any) => {
        setSelectedOption(option.label);
        setIsOpen(false);
        setSelectedImage(option.img);
    };



    return (
        <div className='tabs py-10 2xl:py-20 xl:py-16 lg:py-14 md:py-12 sm:py-10'>
            <div className='container px-3'>
                <AccountCards />
                <div className='tabs-content'>
                    {/* <div className="flex border-b mb-5 2xl:mb-10 xl:mb-7 lg:mb-7 md:mb-6 sm:mb-5 flex-wrap">
                        <button onClick={() => setActiveTab(1)}
                            className={`px-2 2xl:px-4 xl:px-3 lg:px-3 md:px-2 sm:px-2  py-2  ${activeTab === 1 ? 'text-base 2xl:text-xl xl:text-lg lg:text-lg md:text:base sm:text-base font-semibold leading-6 text-multycolor border-b-2 border-multycolor' : 'text-gray-500 hover:text-gray-500'} transition-colors duration-300 text-base 2xl:text-xl xl:text-lg lg:text-lg md:text:base sm:text-base font-semibold leading-6`}
                        >
                            Balance
                        </button>
                        <button
                            onClick={() => setActiveTab(2)}
                            className={`px-2 2xl:px-4 xl:px-3 lg:px-3 md:px-2 sm:px-2  py-2 ${activeTab === 2 ? 'text-base 2xl:text-xl xl:text-lg lg:text-lg md:text:base sm:text-base font-semibold leading-6 text-multycolor border-b-2 border-multycolor' : 'text-gray-500 hover:text-gray-500'} transition-colors duration-300 text-base 2xl:text-xl xl:text-lg lg:text-lg md:text:base sm:text-base font-semibold leading-6`}
                        >
                            Swap
                        </button>
                        <button
                            onClick={() => setActiveTab(3)}
                            className={`px-2 2xl:px-4 xl:px-3 lg:px-3 md:px-2 sm:px-2  py-2 ${activeTab === 3 ? 'text-base 2xl:text-xl xl:text-lg lg:text-lg md:text:base sm:text-base font-semibold leading-6 text-multycolor border-b-2 border-multycolor' : 'text-gray-500 hover:text-gray-500'} transition-colors duration-300 text-base 2xl:text-xl xl:text-lg lg:text-lg md:text:base sm:text-base font-semibold leading-6`}
                        >
                            Send
                        </button>
                        <button
                            onClick={() => setActiveTab(4)}
                            className={`px-2 2xl:px-4 xl:px-3 lg:px-3 md:px-2 sm:px-2  py-2 ${activeTab === 4 ? 'text-base 2xl:text-xl xl:text-lg lg:text-lg md:text:base sm:text-base font-semibold leading-6 text-multycolor border-b-2 border-multycolor' : 'text-gray-500 hover:text-gray-500'} transition-colors duration-300 text-base 2xl:text-xl xl:text-lg lg:text-lg md:text:base sm:text-base font-semibold leading-6`}
                        >
                            Receive
                        </button>
                        <button
                            onClick={() => setActiveTab(5)}
                            className={`px-2 2xl:px-4 xl:px-3 lg:px-3 md:px-2 sm:px-2  py-2 ${activeTab === 5 ? 'text-base 2xl:text-xl xl:text-lg lg:text-lg md:text:base sm:text-base font-semibold leading-6 text-multycolor border-b-2 border-multycolor' : 'text-gray-500 hover:text-gray-500'} transition-colors duration-300 text-base 2xl:text-xl xl:text-lg lg:text-lg md:text:base sm:text-base font-semibold leading-6`}
                        >
                            Burn
                        </button>
                        <button
                            onClick={() => setActiveTab(6)}
                            className={`px-2 2xl:px-4 xl:px-3 lg:px-3 md:px-2 sm:px-2  py-2 ${activeTab === 6 ? 'text-base2xl:text-xl xl:text-lg lg:text-lg md:text:base sm:text-base font-semibold leading-6 text-multycolor border-b-2 border-multycolor' : 'text-gray-500 hover:text-gray-500'} transition-colors duration-300 text-base 2xl:text-xl xl:text-lg lg:text-lg md:text:base sm:text-base font-semibold leading-6`}
                        >
                            Stake
                        </button>
                        <button
                            onClick={() => setActiveTab(7)}
                            className={`px-2 2xl:px-4 xl:px-3 lg:px-3 md:px-2 sm:px-2  py-2 ${activeTab === 7 ? 'text-base 2xl:text-xl xl:text-lg lg:text-lg md:text:base sm:text-base font-semibold leading-6 text-multycolor border-b-2 border-multycolor' : 'text-gray-500 hover:text-gray-500'} transition-colors duration-300 text-base 2xl:text-xl xl:text-lg lg:text-lg md:text:base sm:text-base font-semibold leading-6`}
                        >
                            Transaction history
                        </button>
                    </div> */}
                    <div className="mt-4">
                        {activeTab === 1 && <div>
                            <div className='mb-5 2xl:mb-10 xl:mb-7 lg:mb-7 md:mb-6 sm:mb-5'>
                                <h3 className="text-tabsheading 2xl:text-xxltabsheading xl:text-xltabsheading lg:text-lgtabsheading md:text-mdtabsheading sm:text-smtabsheading font-bold">Balance</h3>
                            </div>
                            <div className='grid grid-cols-1 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1'>
                                <div className='bg-balancebox py-5 px-7 me-3 rounded-3xl mb-5'>
                                    <div className='flex justify-between items-center mb-3'>
                                        <div>
                                            <h4 className='text-2xl font-medium text-white'>ICP</h4>
                                            <span className='text-sm font-regular text-lightgray '>Internet Computer</span>
                                        </div>
                                        <div>
                                            <img src="images/icp-logo.png" alt="8" />
                                        </div>
                                    </div>
                                    <span className='text-base text-lightgray font-medium mb-1'>Balance</span>
                                    <h4 className='text-2xl font-medium mb-1 text-white'>1.1</h4>
                                    <span className='text-base text-lightgray font-medium'>= $10</span>
                                </div>
                            </div>
                        </div>}
                        {activeTab === 2 && <div>
                            <div className='mb-5 2xl:mb-10 xl:mb-7 lg:mb-7 md:mb-6 sm:mb-5'>
                                <h3 className="text-tabsheading 2xl:text-xxltabsheading xl:text-xltabsheading lg:text-lgtabsheading md:text-mdtabsheading sm:text-smtabsheading font-bold">Swap</h3>
                            </div>
                            <div className='grid grid-cols-1 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 mb-2'>
                                <div className='grid grid-cols-2 mb-2 2xl:mb-4 xl:mb-4 lg:mb-4 md:mb-3 sm:mb-2'>
                                    <div className='rounded-2xl me-2'>
                                        <div className="flex items-center space-x-4 ">
                                            <label className="flex items-center text-radiocolor">
                                                <input type="radio" name="option" className="form-radio h-4 w-4 text-radiocolor" />
                                                <span className="ml-2 text-xl font-medium">Swap</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className='rounded-2xl ms-2'>
                                        <div className='rounded-2xl'>
                                            <label className="flex items-center">
                                                <input type="radio" name="option" className="form-radio h-4 w-4 text-radiocolor" />
                                                <span className="ml-2 text-xl font-medium">Receive</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='grid grid-cols-1 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-1'>
                                <div className='me-0 2xl:me-2 xl:me-2 lg:me-2 md:me-0 sm:me-0 mb-3 2xl:mb-0 xl:mb-0 lg:mb-0 md:mb-3 sm:mb-3'>
                                    <div className='block 2xl:flex xl:flex lg:flex md:flex sm:block justify-between mb-5 w-full'>
                                        <div className='bg-white border border-gray-400 text-white py-5 px-7 rounded-borderbox me-0 2xl:me-2 xl:me-2 lg:me-2 md:me-2 sm:me-0 w-full 2xl:w-6/12 xl:w-6/12 lg:w-6/12 md:w-6/12 sm:w-full mb-3 2xl:mb-0 xl:mb-0 lg:mb-0 md:mb-0 sm:mb-3'>
                                            <div className='flex justify-between mb-5	'>
                                                <h2 className='text-swapheading 2xl:text-xxlswapheading xl:text-xlswapheading lg:text-lgswapheading md:text-mdswapheading ms:text-smswapheading font-medium text-black'>ICP</h2>
                                                <div>
                                                    <input className='text-black text-right text-swapheading 2xl:text-xxlswapheading xl:text-xlswapheading lg:text-lgswapheading md:text-mdswapheading ms:text-smswapheading bg-transparent  placeholder-black  focus:outline-none focus:border-transparent w-full' type='number' placeholder='1' />
                                                </div>
                                            </div>
                                            <div className='flex justify-between 	'>
                                                <strong className='text-base text-[#353535] font-medium me-1'>Balance: 1.1</strong>
                                                <Link to="/" className='text-base font-blod text-[#A7B1D7] underline'>Max</Link>
                                            </div>
                                        </div>
                                        <div className='bg-white border border-gray-400 text-white py-5 px-7 rounded-borderbox me-0 2xl:ms-2 xl:ms-2 lg:ms-2 md:ms-2 sm:me-0 w-full 2xl:w-6/12 xl:w-6/12 lg:w-6/12 md:w-6/12 sm:w-full'>
                                            <div className='flex justify-between mb-5'>
                                                <h2 className='text-swapheading 2xl:text-xxlswapheading xl:text-xlswapheading lg:text-lgswapheading md:text-mdswapheading ms:text-smswapheading font-medium text-black'>LBRY</h2>
                                                <h3 className='text-swapvalue text-right text-swapheading 2xl:text-xxlswapheading xl:text-xlswapheading lg:text-lgswapheading md:text-mdswapheading ms:text-smswapheading font-medium'>1000</h3>
                                            </div>
                                            <div className='flex justify-between'>
                                                <strong className='text-base text-[#353535] font-medium me-1'>Balance: 1.1</strong>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <button type='button' className='bg-balancebox text-white w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2'>Swap</button>
                                    </div>
                                </div>
                                <div className='border border-gray-400 text-white py-5 px-5 rounded-2xl ms-3'>
                                    <ul className='ps-0'>
                                        <li className='flex justify-between mb-5'>
                                            <strong className='text-lg font-semibold me-1 text-radiocolor'>Network Fees</strong>
                                            <span className='text-lg font-semibold text-radiocolor'>0.001 ICP</span>
                                        </li>
                                        <li className='flex justify-between mb-5'>
                                            <strong className='text-lg font-semibold me-1 text-radiocolor'>Send</strong>
                                            <span className='text-lg font-semibold text-radiocolor'>1ICP</span>
                                        </li>
                                        <li className='flex justify-between mb-5'>
                                            <strong className='text-lg font-semibold me-1 text-radiocolor'>Receive</strong>
                                            <span className='text-lg font-semibold text-radiocolor'>1000 ALEX</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>}
                        {activeTab === 3 && <div>
                            <div className='mb-5 2xl:mb-10 xl:mb-7 lg:mb-7 md:mb-6 sm:mb-5'>
                                <h3 className="text-tabsheading 2xl:text-xxltabsheading xl:text-xltabsheading lg:text-lgtabsheading md:text-mdtabsheading sm:text-smtabsheading font-bold">Send</h3>
                            </div>
                            <div className='grid grid grid-cols-1 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 mb-12'>
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
                                                <img className='h-5 w-5 me-3' src={selectedImage} />
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
                                    <div className=' border background-color: #fff; py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-3 2xl:px-5 xl:px-5 lg:px-4 md:px-3 sm:px-3 rounded-full mb-4' >
                                        <input className='text-multygray  bg-transparent text-2xl font-medium placeholder-multygray  focus:outline-none focus:border-transparent' type='text' placeholder='Principal ID' />
                                    </div>
                                    <div className='flex items-center mb-4'>
                                        <span className='flex text-2xl font-bold w-circlewidth h-circleheight bg-balancebox rounded-full text-white justify-center items-center me-3'>3</span>
                                        <strong className='text-2xl font-medium'>Enter the amount</strong>
                                    </div>
                                    <div className=' border bg-white py-5 px-5 rounded-borderbox mb-7 '>
                                        <div className='mb-3 w-full'>
                                            <div className='flex justify-between mb-3'>
                                                <h4 className='text-2xl font-medium text-darkgray'>Amount</h4>
                                                <input className='text-darkgray text-right bg-transparent text-2xl font-medium placeholder-darkgray  focus:outline-none focus:border-transparent w-full' type='number' placeholder='0.0' />
                                            </div>
                                            <div className='flex justify-between'>
                                                <div className='flex items-center'>
                                                    <strong className='text-base text-multygray font-medium me-1 me-2'>Available Balance:<span className='text-base text-darkgray ms-2'>  1.1 ICP</span></strong>
                                                    <img className='w-5 h-5' src="images/8-logo.png" alt="apple" />
                                                </div>
                                                <Link to="/" className='text-multycolor underline text-base font-medium'>Max</Link>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <button type='button' className='bg-balancebox text-white w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2'>Send</button>
                                    </div>
                                </div>
                                <div className='ms-0 2xl:ms-3 xl:ms-3 lg:ms-3 md:ms-3 sm:ms-0'>
                                    <div className='border border-gray-400 text-white py-5 px-5 rounded-2xl'>
                                        <ul className='ps-0 pb-7'>
                                            <li className='flex justify-between mb-5'>
                                                <strong className='text-lg font-semibold me-1 text-radiocolor'>Send</strong>
                                                <span className='text-lg font-semibold text-radiocolor'>1 ICP</span>
                                            </li>
                                            <li className='flex justify-between mb-5'>
                                                <strong className='text-lg font-semibold me-5 text-radiocolor whitespace-nowrap'>Send to</strong>
                                                <h6 className='truncate text-lg font-semibold text-radiocolor'>467trtdgdtr6gxf6dt4g...63gefwevyt76</h6>
                                            </li>
                                            <li className='flex justify-between mb-5'>
                                                <strong className='text-lg font-semibold me-1 text-radiocolor'>Network Fees</strong>
                                                <span className='text-lg font-semibold text-radiocolor'><span className='text-multycolor'>0.001</span> ICP</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>}
                        {activeTab === 4 && <div>
                            <div className='mb-5 2xl:mb-10 xl:mb-7 lg:mb-7 md:mb-6 sm:mb-5'>
                                <h3 className="text-tabsheading 2xl:text-xxltabsheading xl:text-xltabsheading lg:text-lgtabsheading md:text-mdtabsheading sm:text-smtabsheading font-bold">Receive</h3>
                            </div>
                            <div className='grid grid grid-cols-1 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 mb-12'>
                                <div className='me-0 2xl:me-3 xl:me-3 lg:me-3 md:me-3 sm:me-0 mb-3 2xl:mb-0 xl:mb-0 lg:mb-3 md:mb-3 sm:mb-3'>
                                    <div className='flex items-center mb-3'>
                                        <span className='flex text-2xl font-bold w-circlewidth h-circleheight bg-balancebox rounded-full text-white justify-center items-center me-3'>1</span>
                                        <strong className='text-2xl font-medium'>Choose token</strong>
                                    </div>
                                    <div className="relative inline-block w-full mb-4">
                                        <div
                                            onClick={() => setIsOpen(!isOpen)}
                                            className="flex justify-between items-center border border-gray-300 rounded-full bg-white py-4 px-5 text-2xl font-semibold cursor-pointer"
                                        >
                                            <div className='flex items-center'>
                                                <img className='h-5 w-5 me-3' src={selectedImage} />
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
                                        <strong className='text-2xl font-medium'>Choose network</strong>
                                    </div>
                                    <div className="relative inline-block w-full mb-4">
                                        <div
                                            onClick={() => setIsOpen(!isOpen)}
                                            className="flex justify-between items-center border border-gray-300 rounded-full bg-white py-4 px-5 text-2xl font-semibold cursor-pointer"
                                        >
                                            <div className='flex items-center'>
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
                                        <span className='flex text-2xl font-bold w-circlewidth h-circleheight bg-balancebox rounded-full text-white justify-center items-center me-3'>3</span>
                                        <strong className='text-2xl font-medium'>Your Address</strong>
                                    </div>
                                    <div>
                                        <label className='mb-2 text-xl font-medium'>ICP Address</label>
                                        <div className='border border-gray-400 py-5 px-5 rounded-borderbox flex items-center justify-between'>
                                            <p className='truncate text-lg font-medium text-radiocolor me-5'>612e8449316ba8b71fb14fed1c03f7319760d85197bb04c538db5af67bdbad17</p>
                                            <div>
                                                <FontAwesomeIcon className='text-black' icon={faClone} />
                                                {/* <FontAwesomeIcon icon={faCheck} /> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='ms-0 2xl:ms-3 xl:ms-3 lg:ms-3 md:ms-3 sm:ms-0'>
                                    <div className='border border-gray-400 text-white py-5 px-5 rounded-2xl'>
                                        <ul className='ps-0'>
                                            <li className='flex justify-between mb-5'>
                                                <strong className='text-lg font-medium me-1 text-radiocolor'>Minimum deposit amount</strong>
                                                <span className='text-lg font-medium text-radiocolor'>0.004 ICP</span>
                                            </li>
                                            <li className='flex justify-between mb-5'>
                                                <strong className='text-lg font-medium me-1 text-radiocolor'>Network Fees:</strong>
                                                <span className='text-lg font-medium text-radiocolor'><span className=' text-multycolor'>0.001</span> ICP</span>
                                            </li>
                                            <li className='mb-5'>
                                                <p className='text-lg font-medium text-radiocolor'>Any contributions less than the minimum amount will not be credited or refunded.</p>
                                            </li>
                                            <li>
                                                <p className='text-lg font-medium text-radiocolor'>Do not deposit assets other than ICP as this may result in irretrievability of deposited assets.</p>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>}
                        {activeTab === 5 && <div>
                            <div className='mb-5 2xl:mb-10 xl:mb-7 lg:mb-7 md:mb-6 sm:mb-5'>
                                <h3 className="text-tabsheading 2xl:text-xxltabsheading xl:text-xltabsheading lg:text-lgtabsheading md:text-mdtabsheading sm:text-smtabsheading font-bold">Burn</h3>
                            </div>
                            <div className='grid grid grid-cols-1 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 mb-12'>
                                <div className='me-0 2xl:me-3 xl:me-3 lg:me-3 md:me-3 sm:me-0 mb-3 2xl:mb-0 xl:mb-0 lg:mb-3 md:mb-3 sm:mb-3'>
                                    <div className='bg-white border py-5 px-5 rounded-borderbox mb-7 '>
                                        <div className='flex justify-between mb-3'>
                                            <h4 className='text-2xl font-medium text-multygray'>Amount</h4>
                                            <input className='text-2xl font-medium text-darkgray text-right bg-transparent w-full placeholder-darkgray  focus:outline-none focus:border-transparent' type='number' placeholder='0.0' />
                                        </div>
                                        <div className='flex justify-between'>
                                            <div className='flex items-center'>
                                                <strong className='text-base text-multygray font-medium me-1'>Balance:<span className='text-darkgray ms-2'>1000 LBRY</span></strong>
                                                <img className='w-4 h-4' src="images/8-logo.png" alt="apple" />
                                            </div>
                                            <Link to="/" className='text-multycolor underline text-base font-bold'>Max</Link>
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
                                            <h3 className='text-right text-2xl font-medium'>0.0</h3>
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
                                            <h3 className='text-right text-2xl font-medium'>0.0</h3>
                                        </div>
                                    </div>
                                    <div>
                                        <button type='button' className='bg-balancebox text-white w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2'>Burn</button>
                                    </div>
                                </div>
                                <div className='ms-0 2xl:ms-3 xl:ms-3 lg:ms-3 md:ms-3 sm:ms-0'>
                                    <div className='border border-gray-400 text-white py-5 px-5 rounded-2xl'>
                                        <ul className='ps-0'>
                                            <li className='flex justify-between mb-5'>
                                                <strong className='text-lg font-medium me-1 text-black'>Max LBRY Burn allowed:</strong>
                                                <span className='text-lg font-medium text-black'>110 LBRY</span>
                                            </li>
                                            <li className='flex justify-between mb-5'>
                                                <strong className='text-lg font-medium  me-1 text-black'>1000 LBRY
                                                    <span className='mx-2'><FontAwesomeIcon icon={faArrowRightLong} /></span>0.5 ICP
                                                </strong>
                                            </li>
                                            <li className='flex justify-between mb-5'>
                                                <strong className='text-lg font-medium me-1 text-black'>1 LBRY
                                                    <span className='mx-2'><FontAwesomeIcon icon={faArrowRightLong} /></span>1000 ALEX
                                                </strong>
                                            </li>
                                            <li className='flex justify-between'>
                                                <strong className='text-lg font-medium me-1 text-black'>Network Fees</strong>
                                                <span className='text-lg font-medium text-black'><span className=' text-multycolor'>0.001</span> ICP</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>}
                        {activeTab === 6 && <div>
                            <div className='grid grid grid-cols-1 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 mb-7'>
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
                                                    <strong className='text-lg text-radiocolor font-semibold me-1'>20000000 ALEX</strong>
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
                                    <div className=' border bg-white py-5 px-5 rounded-borderbox mb-7 '>
                                        <div className='mb-3'>
                                            <div className='flex justify-between mb-3'>
                                                <h4 className='text-2xl font-medium text-darkgray'>Amount</h4>
                                                <input className='text-darkgray text-right bg-transparent text-2xl font-medium placeholder-darkgray w-full focus:outline-none focus:border-transparent' type='number' placeholder='0.0' />
                                            </div>
                                            <div className='flex justify-between'>
                                                <div className='flex items-center'>
                                                    <strong className='text-base text-multygray font-medium me-1 me-2'>Available Balance:<span className='text-base text-darkgray ms-2'>0 ALEX</span></strong>
                                                    <img className='w-5 h-5' src="images/8-logo.png" alt="apple" />
                                                </div>
                                                <Link to="/" className='text-multycolor underline text-base font-medium'>Max</Link>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <button type='button' className='bg-balancebox text-white w-full rounded-full text-base 2xl:text-2xl xl:text-xl lg:text-xl md:text-lg sm:text-base font-semibold py-2 2xl:py-4 xl:py-4 lg:py-3 md:py-3 sm:py-2 px-2 2xl:px-4 xl:px-4 lg:px-3 md:px-3 sm:px-2'>Stake</button>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto lg:overflow-x-auto">
                                <table className="min-w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-300 hover:bg-gray-100">
                                            <th className="py-3 text-left text-lg font-semibold text-radiocolor whitespace-nowrap">
                                                <span className='flex me-7'>Date</span>
                                            </th>
                                            <th className="py-3 text-left text-lg font-semibold text-radiocolor whitespace-nowrap">
                                                <span className='flex me-7'>Amount staked</span>
                                            </th>
                                            <th className="py-3 text-left text-lg font-semibold text-radiocolor whitespace-nowrap">
                                                <span className='flex me-7'>Amount earned</span>
                                            </th>
                                            <th className="py-3 text-left text-lg font-semibold text-radiocolor whitespace-nowrap">
                                                <span className='flex me-7'>Earned today</span>
                                            </th>
                                            {/* <th className="px-6 py-3 text-left">
                                                <div className='text-xl font-medium text-radiocolor items-center flex'>
                                                    <span className='me-2 flex'>Free</span>
                                                    <div className='h-5 w-5 border-2 border-[#FF9900] flex justify-center items-center rounded-full '>
                                                        <FontAwesomeIcon className='text-multycolor text-xs' icon={faExclamation} />
                                                    </div>
                                                </div>
                                            </th> */}
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-600 text-sm font-light">
                                        <tr className="border-b border-gray-300 hover:bg-gray-100">
                                            <td className="py-3 text-left text-base font-medium text-radiocolor whitespace-nowrap">2024-09-09, 11:02:08</td>
                                            <td className="py-3 px-6 text-left text-base font-medium text-radiocolor whitespace-nowrap">12 ALEX</td>
                                            <td className="py-3 px-6 text-left text-base font-medium text-radiocolor whitespace-nowrap">3.21 ALEX</td>
                                            <td className="py-3 px-6 text-left text-base font-medium text-radiocolor whitespace-nowrap">3.21 ALEX</td>
                                            <th className="py-3 px-6 text-left">
                                                <div className='stake-table whitespace-nowrap'>
                                                    <button className='text-xl font-semibold text-white bg-radiocolor py-2 px-5 me-3 rounded-full'>Claim</button>
                                                    <button className='text-xl font-semibold text-multycolor  border-2 border-[#FF9900] py-2 px-5 me-3 rounded-full'>Unstake</button>
                                                </div>
                                            </th>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>}
                        {activeTab === 7 && <div>
                            <div className="overflow-x-auto lg:overflow-x-auto">
                                <table className="min-w-full border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="py-3 text-left">
                                                <div className='text-xl font-medium text-radiocolor items-center flex'>
                                                    <span className='me-2 flex'>Timestemp</span>
                                                    <div className='h-5 w-5 border-2 border-[#FF9900] flex justify-center items-center rounded-full '>
                                                        <FontAwesomeIcon className='text-multycolor text-xs' icon={faExclamation} />
                                                    </div>
                                                </div>
                                            </th>
                                            <th className="px-6 py-3">
                                                <div className='ext-xl font-medium text-radiocolor items-center flex'>
                                                    <span className='me-2 flex'>Type</span>
                                                    <div className='h-5 w-5 border-2 border-[#FF9900] flex justify-center items-center rounded-full '>
                                                        <FontAwesomeIcon className='text-multycolor text-xs' icon={faExclamation} />
                                                    </div>
                                                </div>
                                            </th>
                                            <th className="px-6 py-3 text-left">
                                                <div className='text-xl font-medium text-radiocolor items-center flex'>
                                                    <span className='me-2 flex'>Amount</span>
                                                    <div className='h-5 w-5 border-2 border-[#FF9900] flex justify-center items-center rounded-full '>
                                                        <FontAwesomeIcon className='text-multycolor text-xs' icon={faExclamation} />
                                                    </div>
                                                </div>
                                            </th>
                                            <th className="px-6 py-3 text-left">
                                                <div className='text-xl font-medium text-radiocolor items-center flex'>
                                                    <span className='me-2 flex'>Free</span>
                                                    <div className='h-5 w-5 border-2 border-[#FF9900] flex justify-center items-center rounded-full '>
                                                        <FontAwesomeIcon className='text-multycolor text-xs' icon={faExclamation} />
                                                    </div>
                                                </div>
                                            </th>
                                            <th className="px-6 py-3 text-left">
                                                <div className='text-xl font-medium text-radiocolor items-center flex'>
                                                    <span className='me-2 flex'>State</span>
                                                    <div className='h-5 w-5 border-2 border-[#FF9900] flex justify-center items-center rounded-full '>
                                                        <FontAwesomeIcon className='text-multycolor text-xs' icon={faExclamation} />
                                                    </div>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-600 text-sm font-light">
                                        <tr className="border-b border-gray-300 hover:bg-gray-100">
                                            <td className="py-3 text-left text-base font-medium text-radiocolor">2024-09,11:02:08</td>
                                            <td className="py-3 px-6 text-left text-base font-medium text-radiocolor">
                                                <button className='bg-sendbtnbg bg-opacity-30 px-3 rounded-bordertb'>Send</button>
                                            </td>
                                            <td className="py-3 px-6 text-left text-base font-medium text-radiocolor"><span>12</span>ICP</td>
                                            <td className="py-3 px-6 text-left text-base font-medium text-radiocolor"><span>0</span>ICP</td>
                                            <th className="py-3 px-6 text-left">
                                                <div className='text-base font-medium text-radiocolor items-center flex'>
                                                    <span className='me-2 flex'>Completed</span>
                                                    <FontAwesomeIcon icon={faCheck} />
                                                </div>
                                            </th>
                                        </tr>
                                        <tr className="border-b border-gray-300 hover:bg-gray-100">
                                            <td className="py-3 text-left text-base font-medium text-radiocolor">2024-09,11:02:08</td>
                                            <td className="py-3 px-6 text-left text-base font-medium text-radiocolor">
                                                <button className='bg-receive bg-opacity-30 px-3 rounded-bordertb'>Receive</button>
                                            </td>
                                            <td className="py-3 px-6 text-left text-base font-medium text-radiocolor"><span>12</span>ICP</td>
                                            <td className="py-3 px-6 text-left text-base font-medium text-radiocolor"><span>0</span>ICP</td>
                                            <th className="py-3 px-6 text-left">
                                                <div className='text-base font-medium text-radiocolor items-center flex'>
                                                    <span className='me-2 flex'>Completed</span>
                                                    <FontAwesomeIcon icon={faCheck} />
                                                </div>
                                            </th>
                                        </tr>
                                        <tr className="border-b border-gray-300 hover:bg-gray-100">
                                            <td className="py-3 text-left text-base font-medium text-radiocolor">2024-09,11:02:08</td>
                                            <td className="py-3 px-6 text-left text-base font-medium text-radiocolor">
                                                <button className='bg-sendbtnbg bg-opacity-30 px-3 rounded-bordertb'>Send</button>
                                            </td>
                                            <td className="py-3 px-6 text-left text-base font-medium text-radiocolor"><span>12</span>ICP</td>
                                            <td className="py-3 px-6 text-left"><span>0</span>ICP</td>
                                            <th className="py-3 px-6 text-left">
                                                <div className='text-base font-medium text-radiocolor items-center flex'>
                                                    <span className='me-2 flex'>Completed</span>
                                                    <FontAwesomeIcon icon={faCheck} />
                                                </div>
                                            </th>
                                        </tr>
                                        <tr className="border-b border-gray-300 hover:bg-gray-100">
                                            <td className="py-3 text-left text-base font-medium text-radiocolor">2024-09,11:02:08</td>
                                            <td className="py-3 px-6 text-left text-base font-medium text-radiocolor">
                                                <button className='bg-receive bg-opacity-30 px-3 rounded-bordertb'>Receive</button>
                                            </td>
                                            <td className="py-3 px-6 text-left text-base font-medium text-radiocolor"><span>12</span>ICP</td>
                                            <td className="py-3 px-6 text-left text-base font-medium text-radiocolor"><span>0</span>ICP</td>
                                            <th className="py-3 px-6 text-left">
                                                <div className='text-base font-medium text-radiocolor items-center flex'>
                                                    <span className='me-2 flex'>Completed</span>
                                                    <FontAwesomeIcon icon={faCheck} />
                                                </div>
                                            </th>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>}
                    </div>
                </div>
            </div>
        </div >
    );
}

export default Home;
