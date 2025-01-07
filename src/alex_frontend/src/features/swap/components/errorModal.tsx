import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface ErrorModalProps {
    show: boolean;
    setShow: any;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ show,setShow }) => {
    if (!show) return null; // Only render modal if show is true
    return (
        <div className="bg-gray flex items-center justify-center min-h-screen w-full fixed z-50 top-0 left-0">
            <div className="bg-white max-w-sm w-full h-[430px] rounded-2xl p-7 pb-14 w-11/12">
                <div className="text-right mb-9">
                    <FontAwesomeIcon icon={faXmark} className="text-gray-400 text-2xl" onClick={() => { setShow(false) }} role="button" />
                </div>
                <div className="text-center">
                    <div className="mb-5">
                        <img src="/images/error.png" className="m-auto" />
                    </div>
                    <h4 className="text-2xl font-medium">Something went wrong...</h4>
                    <p className="mb-4 text-base font-normal leading-6">
                    Please try again or seek help if needed
                    </p>
                    <button className="h-14 min-w-72 rounded-[44px] px-7 bg-black text-white text-2xl font-semibold" onClick={() => { setShow(false) }} >
                        Back
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ErrorModal;
