import React from "react";
import { LoaderCircle } from "lucide-react";

const Processing = ()=>(
    <div className="flex-shrink h-auto flex justify-between gap-1 px-4 py-2 items-center border border-white text-[#828282] rounded-full cursor-not-allowed">
        <span className="text-base font-normal font-roboto-condensed tracking-wider">
            Signing In
        </span>
        <LoaderCircle size={18} className="animate animate-spin"/>
    </div>
)


export default Processing;