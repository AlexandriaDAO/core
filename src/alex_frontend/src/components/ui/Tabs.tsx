import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Tabs() {
    const location = useLocation();
    const navigate = useNavigate();

	return (
		<div className="flex items-center gap-6">
			<button
				onClick={()=>navigate('/manager')}
				className={`transition-all duration-100 cursor-pointer font-syne font-medium text-xl leading-7 text-center tracking-wider flex items-center ${location.pathname == '/manager' ? 'text-white':'text-[#8E8E8E] hover:text-white'} `}
			>
                Lbry
			</button>
			<button
				onClick={()=>navigate('/swap')}
				className={`transition-all duration-100 cursor-pointer font-syne font-medium text-xl leading-7 text-center tracking-wider flex items-center ${location.pathname == '/manager' ? 'text-white':'text-[#8E8E8E] hover:text-white'} `}
			>
                Swap
			</button>
			<button
				onClick={()=>navigate('/whitepaper')}
				className={`transition-all duration-100 cursor-pointer font-syne font-medium text-xl leading-7 text-center tracking-wider flex items-center ${location.pathname == '/' ? 'text-white':'text-[#8E8E8E] hover:text-white'} `}
			>
                Info
			</button>
		</div>
	);
}
