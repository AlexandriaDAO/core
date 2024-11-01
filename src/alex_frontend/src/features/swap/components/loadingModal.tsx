import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface SuccessModalProps {
    show: boolean;
    message1: string;
    message2: string;
    setShow: any;
}

const LoadingModal: React.FC<SuccessModalProps> = ({ show, message1, message2, setShow }) => {
    if (!show) return null; // Only render modal if show is true
    return (
        <div className="bg-gray flex items-center justify-center min-h-screen w-full fixed z-50 top-0 left-0">
            <div className="bg-white max-w-sm w-full h-[430px] rounded-2xl p-7 pb-14">
                <div className="text-right mb-9">
                    <FontAwesomeIcon icon={faXmark} className="text-gray-400 text-2xl" onClick={() => { setShow(false) }} role="button"/>
                </div>
                <div className="relative flex items-center justify-center w-40 h-40 mx-auto rounder-full mb-5">
                    <div className="absolute inset-0 w-full h-full border border-4 border-[#C5CFF9] rounded-full"></div>
                    <div className="absolute loader inset-0 border-4 border-[#000000] border-t-white rounded-full h-full w-full animate-spin"></div>
                </div>
                <div className="text-center">
                    <h4 className="text-2xl font-medium mb-4">{message1}</h4>
                    <p className="m-0 text-base font-normal leading-6"> {message2}</p>
                </div>
            </div>
        </div>
    );
};

export default LoadingModal;
