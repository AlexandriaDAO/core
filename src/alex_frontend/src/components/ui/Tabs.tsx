import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Tabs() {
    const location = useLocation();
    const navigate = useNavigate();

    const baseStyles = `
        transition-all duration-100 
        cursor-pointer 
        font-syne 
        text-[20px] 
        font-semibold 
        leading-normal 
        tracking-normal 
        flex items-center
        text-[#FFF]
    `;

    return (
        <div className="flex items-center gap-6">
            <button
                onClick={() => navigate('/')}
                className={`${baseStyles} ${location.pathname === '/' ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
            >
                APPS
            </button>
            <button
                onClick={() => navigate('/manager')}
                className={`${baseStyles} ${location.pathname === '/manager' ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
            >
                LBRY
            </button>
            <button
                onClick={() => navigate('/swap')}
                className={`${baseStyles} ${location.pathname === '/swap' ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
            >
                SWAP
            </button>
            <button
                onClick={() => navigate('/whitepaper')}
                className={`${baseStyles} ${location.pathname === '/whitepaper' ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
            >
                INFO
            </button>
        </div>
    );
}
