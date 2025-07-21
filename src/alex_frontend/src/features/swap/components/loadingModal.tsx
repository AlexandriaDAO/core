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
        <div className="bg-black/80 flex items-center justify-center min-h-screen w-full fixed z-50 top-0 left-0">
            <div className="bg-background border border-border max-w-sm w-full h-[430px] rounded-2xl p-7 pb-14 w-11/12">
                <div className="text-right mb-9">
                    <FontAwesomeIcon icon={faXmark} className="text-muted-foreground text-2xl" onClick={() => { setShow(false) }} role="button" />
                </div>
                <div className="relative flex items-center justify-center w-40 h-40 mx-auto rounder-full mb-5">
                    {/* <div className="absolute inset-0 w-full h-full border border-4 border-[#C5CFF9] rounded-full"></div>
                    <div className="absolute loader inset-0 border-4 border-[#000000] border-t-white rounded-full h-full w-full animate-spin"></div> */}
                    <svg viewBox="0 0 160 160" className="animate-spin">
                        <g id="Group_6891" data-name="Group 6891" transform="translate(-3382 704)">
                            <g id="Ellipse_110" data-name="Ellipse 110" transform="translate(3382 -704)" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="5">
                                <circle cx="80" cy="80" r="80" stroke="none" />
                                <circle cx="80" cy="80" r="77.5" fill="none" />
                            </g>
                            <g id="Ellipse_111" data-name="Ellipse 111" transform="translate(3382 -704)" fill="none" stroke="currentColor" strokeWidth="5" strokeDasharray="161 362">
                                <circle cx="80" cy="80" r="80" stroke="none" />
                                <circle cx="80" cy="80" r="77.5" fill="none" />
                            </g>
                        </g>
                    </svg>
                </div>
                <div className="text-center">
                    <h4 className="text-foreground text-2xl font-medium mb-4">{message1}</h4>
                    <p className="text-muted-foreground m-0 text-base font-normal leading-6">{message2}</p>
                </div>
            </div>
        </div>
    );
};

export default LoadingModal;


