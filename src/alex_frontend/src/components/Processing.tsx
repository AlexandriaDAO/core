import React from "react";
import { LoaderCircle } from "lucide-react";

type ProcessingProps = {
    message?: string;
}

const Processing: React.FC<ProcessingProps> = ({ message = "Processing..." }) => (
    <div className="flex-shrink h-auto flex justify-between gap-1 px-4 py-2 items-center border border-white text-[#828282] rounded-full cursor-not-allowed">
        <span className="w-max text-base font-normal font-roboto-condensed tracking-wider">{message}</span>
        <LoaderCircle size={18} className="animate animate-spin"/>
    </div>
)

export default Processing;