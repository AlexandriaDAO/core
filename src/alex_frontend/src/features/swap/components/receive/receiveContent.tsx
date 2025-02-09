import React, {useState } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import CopyHelper from "../copyHelper";
import { options } from "@/utils/utils";
import QRCode from "react-qr-code";

const ReceiveContent = () => {
    const auth = useAppSelector((state) => state.auth);
    const [isOpen, setIsOpen] = useState(false);
    const [networkOpen, setNetworkOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState("Select an option");
    const [selectedNetwork, setSelectedNetwork] = useState("ICP(Internet Computer)");
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedNetworkImage, setSelectedNetworkImage] = useState("images/icp-logo.png");
    const [fee, setFee] = useState();
    const networkOptions = [
        { value: "ICP", label: "ICP(Internet Computer)", img: "images/icp-logo.png" },

    ];


    const handleSelect = (option: any) => {
        setSelectedOption(option.label);
        setFee(option.fee);
        setIsOpen(false);
        let img = "images/8-logo.png";
        if (option.label === "ALEX") {
            img = "images/alex-logo.svg";
        } else if (option.label === "LBRY") {
            img = "images/lbry-logo.svg";
        }
        setSelectedImage(img);
    };
    const handleNetworkSelect = (option: any) => {
        setSelectedNetwork(option.label);
        setNetworkOpen(false);
        setSelectedNetworkImage(option.img);
    };


    return (<>
        <div>
            <div className='mb-5 2xl:mb-10 xl:mb-7 lg:mb-7 md:mb-6 sm:mb-5'>
                <h3 className="text-tabsheading 2xl:text-xxltabsheading xl:text-xltabsheading lg:text-lgtabsheading md:text-mdtabsheading sm:text-smtabsheading font-bold">Receive</h3>
            </div>
            <div className='grid grid grid-cols-1 2xl:grid-cols-2 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 mb-12'>
                <div className='me-0 2xl:me-3 xl:me-3 lg:me-3 md:me-3 sm:me-0 mb-3 2xl:mb-0 xl:mb-0 lg:mb-3 md:mb-3 sm:mb-3'>
                    <div className='flex items-center mb-3'>
                        <span className='flex lg:text-2xl md:text-xl sm:text-lg xs:text-base font-bold w-circlewidth h-circleheight bg-balancebox rounded-full text-white justify-center items-center me-3'>1</span>
                        <strong className='lg:text-2xl md:text-xl sm:text-lg xs:text-base font-medium'>Choose token</strong>
                    </div>
                    <div className="relative inline-block w-full mb-4">
                        <div
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex justify-between items-center border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 py-4 px-5 lg:text-2xl md:text-xl sm:text-lg xs:text-base font-semibold cursor-pointer"
                        >
                            <div className='flex items-center'>
                                {selectedImage ? <img className='h-5 w-5 me-3' src={selectedImage} alt="Selected" /> : null}
                                <span className='lg:text-xl md:text-lg sm:text-sm font-medium text-black dark:text-white'>{selectedOption}</span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                        {isOpen && (
                            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
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
                                            className="flex items-center py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
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
                        <span className='flex lg:text-2xl md:text-xl sm:text-lg xs:text-base font-bold w-circlewidth h-circleheight bg-balancebox rounded-full text-white justify-center items-center me-3'>2</span>
                        <strong className='lg:text-2xl md:text-xl sm:text-lg xs:text-base font-medium'>Choose network</strong>
                    </div>
                    <div className="relative inline-block w-full mb-4">
                        <div
                            onClick={() => setNetworkOpen(!networkOpen)}
                            className="flex justify-between items-center border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 py-4 px-5 lg:text-2xl md:text-xl sm:text-lg xs:text-base font-semibold cursor-pointer"
                        >

                            <div className='flex items-center'>
                                <span className='lg:text-xl md:text-lg sm:text-sm font-medium text-black dark:text-white'>{selectedNetwork}</span>


                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                        {networkOpen && (
                            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                                {networkOptions.map((option, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleNetworkSelect(option)}
                                        className="flex items-center py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer dark:text-white"
                                    >
                                        <img src={option.img} alt={option.label} className="h-5 w-5 mr-3" />
                                        <span>{option.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className='flex items-center mb-7'>
                        <span className='flex lg:text-2xl md:text-xl sm:text-lg xs:text-base font-bold w-circlewidth h-circleheight bg-balancebox rounded-full text-white justify-center items-center me-3'>3</span>
                        <strong className='lg:text-2xl md:text-xl sm:text-lg xs:text-base font-medium'>Your Address</strong>
                    </div>
                    <div className="flex items-center">
                        <div style={{ height: "120px", marginRight: "20px", width: "120px" }}>
                            {auth.user && <QRCode
                                size={256}
                                style={{ height: "100%", maxWidth: "100%", width: "100%" }}
                                value={auth.user.principal}
                                viewBox={`0 0 100% 100%`}
                            />}
                        </div>
                        <div className="w-[calc(100%-140px)]">
                            <label className='mb-2 text-xl font-medium dark:text-white'>ICP Address</label>
                            <div className='border border-gray-400 dark:border-gray-600 py-5 px-5 rounded-borderbox flex items-center justify-between bg-white dark:bg-gray-800'>
                                <p className='truncate text-lg font-medium text-radiocolor dark:text-gray-300 me-5'>{auth.user?.principal.toString()}</p>
                                <div>
                                    {auth.user && <CopyHelper account={auth.user.principal} /> }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='ms-0 2xl:ms-3 xl:ms-3 lg:ms-3 md:ms-3 sm:ms-0'>
                    <div className='border border-gray-400 dark:border-gray-600 text-white py-5 px-5 rounded-2xl bg-white dark:bg-gray-800'>
                        <ul className='ps-0'>
                            <li className='flex justify-between mb-5'>
                                <strong className='text-lg font-medium me-1 text-radiocolor dark:text-gray-300'>Minimum deposit amount</strong>
                                <span className='text-lg font-medium text-radiocolor dark:text-gray-300'>0.001 {selectedOption}</span>
                            </li>
                            <li className='flex justify-between mb-5'>
                                <strong className='text-lg font-medium me-1 text-radiocolor dark:text-gray-300'>Network Fees:</strong>
                                <span className='text-lg font-medium text-radiocolor dark:text-gray-300'><span className='text-multycolor'>{fee}</span> {selectedOption}</span>
                            </li>
                            <li>
                                <p className='text-lg font-medium text-radiocolor dark:text-gray-300'>Do not deposit assets other than those listed as this may result in irretrievability of deposited assets.</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </>)
}
export default ReceiveContent;