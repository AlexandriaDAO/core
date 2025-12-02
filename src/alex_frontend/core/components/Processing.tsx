import React from "react";
import { LoaderCircle } from "lucide-react";

type ProcessingProps = {
    message?: string;
}

const Processing: React.FC<ProcessingProps> = ({ message = "Processing..." }) => (
    <div className="flex-shrink h-auto flex justify-between gap-1 px-3 py-1.5 sm:px-4 sm:py-2 items-center border border-white text-[#828282] rounded-full cursor-not-allowed">
        <span className="w-max text-sm sm:text-base font-normal font-roboto-condensed tracking-wider">{message}</span>
        <LoaderCircle className="w-4 h-4 sm:w-[18px] sm:h-[18px] animate animate-spin"/>
    </div>
)

export default Processing;