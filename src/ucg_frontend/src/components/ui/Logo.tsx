import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Logo() {
    const navigate = useNavigate();
	return (
        <span onClick={()=>navigate('/')} className="font-extrabold cursor-pointer text-white hover:text-[#8E8E8E] text-4xl leading-none font-syne">
            UG
        </span>
	);
}

export default Logo;
